/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import type { ReactNode } from 'react'
import React from 'react';
import { AccordionContext, AccordionItemContext, useAccordion, useAccordion as UseAccordion, useAccordionItem } from './accordion-context';
import { ChevronDown, ChevronLeft } from 'lucide-react';

type AccordionProps = {
	children: ReactNode;
	allowMultiple?: boolean;
	defaultExpanded?: string[];

	expandedItems?: string[];
	expandedChange?: (items: string[]) => void;
}

export const Accordion = ({
	children,
	allowMultiple = false,
	defaultExpanded,
	expandedChange,
	expandedItems
}: AccordionProps) => {
	const [internalItems, setInternalItems] = React.useState(() => new Set(defaultExpanded));
	const triggerRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map())

	const isControlled = expandedItems !== undefined;
	const expanded = isControlled ? new Set(expandedItems) : internalItems;

	const toggleItem = React.useCallback((id: string) => {
		if (isControlled) {
			// Controlled mode: call the callback
			const next = new Set(expanded);
			if (next.has(id)) {
				next.delete(id);
			} else {
				if (!allowMultiple) {
					next.clear();
				}
				next.add(id)
			}
			expandedChange?.(Array.from(next));
		} else {
			// Uncontrolled mode: update internal state
			setInternalItems(prev => {
				const next = new Set(prev);
				if (next.has(id)) {
					next.delete(id);
				} else {
					if (!allowMultiple) {
						next.clear()
					}
					next.add(id)
				}
				return next;
			});
		}
	}, [allowMultiple, expanded, expandedChange, isControlled]);

	const registerTrigger = React.useCallback((id: string, ref: HTMLButtonElement) => {
		triggerRefs.current.set(id, ref)
	}, [])

	const unregisterTrigger = React.useCallback((id: string) => {
		triggerRefs.current.delete(id)
	}, [])

	const focusTrigger = React.useCallback((direction: 'next' | 'prev' | 'first' | 'last', currentId: string) => {
		const triggers = Array.from(triggerRefs.current.entries());
		const currentIndex = triggers.findIndex(([id]) => id === currentId);

		let targetIndex: number;

		switch (direction) {
			case 'first':
				targetIndex = 0;
				break;
			case 'last':
				targetIndex = triggers.length - 1;
				break;
			case 'next':
				targetIndex = (currentIndex + 1) % triggers.length;
				break;
			case 'prev':
				targetIndex = (currentIndex - 1 + triggers.length) % triggers.length;
				break;
		}

		triggers[targetIndex]?.[1].focus();

	}, [])

	const value = React.useMemo(
		() => ({
			expandedItems: expanded,
			toggleItem,
			allowMultiple,
			registerTrigger,
			unregisterTrigger,
			focusTrigger,
		}),
		[expanded, toggleItem, allowMultiple, registerTrigger, unregisterTrigger, focusTrigger])

	return (
		<AccordionContext.Provider value={value}>
			<div role='region'>
				{children}
			</div>
		</AccordionContext.Provider>
	)
}

type AccordionItemProps = {
	children: ReactNode;
	id: string;
}

Accordion.Item = ({ children, id }: AccordionItemProps) => {
	const { expandedItems } = UseAccordion();
	const isExpanded = expandedItems.has(id);

	const value = React.useMemo(
		() => ({ itemId: id, isExpanded }),
		[id, isExpanded]);

	return (
		<AccordionItemContext.Provider value={value}>
			<div className="accordion-item">{children}</div>
		</AccordionItemContext.Provider>
	)
}

Accordion.Trigger = ({ children }: { children: ReactNode }) => {
	const { toggleItem, registerTrigger, unregisterTrigger, focusTrigger } = useAccordion()
	const { itemId, isExpanded } = useAccordionItem();
	const buttonRef = React.useRef<HTMLButtonElement>(null)

	React.useEffect(() => {
		if (buttonRef.current) {
			registerTrigger(itemId, buttonRef.current)
		}
		return () => { unregisterTrigger(itemId) }
	}, [itemId, registerTrigger, unregisterTrigger]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				focusTrigger('next', itemId)
				break;
			case 'ArrowUp':
				e.preventDefault();
				focusTrigger('prev', itemId)
				break;
			case 'Home':
				e.preventDefault();
				focusTrigger('first', itemId)
				break;
			case 'End':
				e.preventDefault();
				focusTrigger('last', itemId)
				break;
		}
	}

	return (
		<button
			ref={buttonRef}
			onClick={() => toggleItem(itemId)}
			onKeyDown={handleKeyDown}
			aria-expanded={isExpanded}
			aria-controls={`panel-${itemId}`}
			id={`trigger-${itemId}`}
		>
			{children}
			{isExpanded ? <ChevronLeft style={{ width: 10 }} /> : <ChevronDown style={{ width: 10 }} />}
		</button>
	)
}

Accordion.Panel = ({ children }: { children: ReactNode }) => {
	const { itemId, isExpanded } = useAccordionItem();
	const contentRef = React.useRef<HTMLDivElement>(null);
	const [height, setHeight] = React.useState<number | undefined>(isExpanded ? undefined : 0)

	// Handle expand/collapse animation
	React.useEffect(() => {
		if (!contentRef.current) return;

		if (isExpanded) {
			const contentHeight = contentRef.current.scrollHeight;
			setHeight(contentHeight)

			// After animation completes, set to auto for dynamic content
			const timer = setTimeout(() => {
				setHeight(undefined);
			}, 300)

			return () => clearTimeout(timer);
		} else {
			// First set to current height then to 0
			const contentHeight = contentRef.current.scrollHeight;
			setHeight(contentHeight)

			// Use requestAnimationFrame to ensure the browser registers the height before animating to 0
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setHeight(0)
				})
			})
		}
	}, [isExpanded])

	// Handle content size changes while expanded
	React.useEffect(() => {
		if (!isExpanded || !contentRef.current) return;

		const resizeObserver = new ResizeObserver((_) => {
			// Onl update if we're in "auto" mode (animation complete)
			if (height === undefined) {
				// Content changed, but we're already at auto height
				// No action needed - auto handles it
			}
		});

		resizeObserver.observe(contentRef.current);

		return () => resizeObserver.disconnect();
	}, [isExpanded, height])

	return (
		<div
			id={`panel-${itemId}`}
			role="region"
			aria-labelledby={`trigger-${itemId}`}
			style={{
				height: height === undefined ? 'auto' : height,
				overflow: 'hidden',
				transition: 'height 300ms ease-out'
			}}
		>
			<div ref={contentRef}>
				{children}
			</div>
		</div>
	)
}