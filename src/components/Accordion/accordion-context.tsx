import { createContext, useContext } from 'react';

type AccordionContextType = {
	expandedItems: Set<string>;
	toggleItem: (id: string) => void;
	allowMultiple: boolean;

	registerTrigger: (id: string, ref: HTMLButtonElement) => void;
	unregisterTrigger: (id: string) => void;
	focusTrigger: (direction: 'next' | 'prev' | 'first' | 'last', current: string) => void;
}

type AccordionItemContextType = {
	itemId: string;
	isExpanded: boolean;
}

export const AccordionContext = createContext<AccordionContextType | null>(null);
export const AccordionItemContext = createContext<AccordionItemContextType | null>(null);
export const useAccordion = (): AccordionContextType => {
	const context = useContext(AccordionContext);
	if (context === null) {
		throw new Error(
			'Accordion compound components must be used within <Accordion>'
		)
	}

	return context;
}

export const useAccordionItem = (): AccordionItemContextType => {
	const context = useContext(AccordionItemContext);
	if (context === null) {
		throw new Error(
			'AccordionContent/AccordionTrigger must be used within <AccordionItem>'
		)
	}

	return context;
}