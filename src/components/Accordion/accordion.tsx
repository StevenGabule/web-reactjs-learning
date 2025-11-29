/* eslint-disable react-hooks/rules-of-hooks */
import type { ReactNode } from 'react'
import React from 'react';
import { AccordionContext, AccordionItemContext, useAccordion, useAccordion as UseAccordion, useAccordionItem } from './accordion-context';
import { ChevronDown, ChevronLeft } from 'lucide-react';

type AccordionProps = {
	children: ReactNode;
	allowMultiple?: boolean;
	defaultExpanded?: string[]
}

export const Accordion = ({
	children,
	allowMultiple = false,
	defaultExpanded
}: AccordionProps) => {
	const [expandedItems, setExpandedItems] = React.useState(() => new Set(defaultExpanded));
	const toggleItem = React.useCallback((id: string) => {
		setExpandedItems(prev => {
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
		})
	}, [allowMultiple])

	const value = React.useMemo(
		() => ({ expandedItems, toggleItem, allowMultiple }),
		[expandedItems, toggleItem, allowMultiple])

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
	const { toggleItem } = useAccordion()
	const { itemId, isExpanded } = useAccordionItem();

	return (
		<button
			onClick={() => toggleItem(itemId)}
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
	return (
		<div
			id={`panel-${itemId}`}
			role="region"
			aria-labelledby={`trigger-${itemId}`}
			hidden={!isExpanded}
		>
			{isExpanded && children}
		</div>
	)
}