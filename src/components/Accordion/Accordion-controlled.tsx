import React from 'react';
import { Accordion } from './accordion';

export default function AccordionControlled() {
	const [expanded, setExpanded] = React.useState(['item-01'])

	return (
		<>
			<button onClick={() => setExpanded([])}>Collapse All</button>
			<button onClick={() => setExpanded(['item-01', 'item-02', 'item-03',])}>Collapse All</button>

			<Accordion allowMultiple expandedChange={setExpanded} expandedItems={expanded}>
				<Accordion.Item id={'item-01'}>
					<Accordion.Trigger>01. What is ReactJS?</Accordion.Trigger>
					<Accordion.Panel>
						01. Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quasi sunt soluta ad fugit odit enim, repudiandae ratione. Atque ex neque aliquam voluptatem iste debitis quisquam id in ducimus doloribus!
					</Accordion.Panel>
				</Accordion.Item>

				<Accordion.Item id={'item-02'}>
					<Accordion.Trigger>02. What is NestJS?</Accordion.Trigger>
					<Accordion.Panel>
						02. Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quasi sunt soluta ad fugit odit enim, repudiandae ratione. Atque ex neque aliquam voluptatem iste debitis quisquam id in ducimus doloribus!
					</Accordion.Panel>
				</Accordion.Item>

				<Accordion.Item id={'item-03'}>
					<Accordion.Trigger>03. What is NodeJS?</Accordion.Trigger>
					<Accordion.Panel>
						03. Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quasi sunt soluta ad fugit odit enim, repudiandae ratione. Atque ex neque aliquam voluptatem iste debitis quisquam id in ducimus doloribus!
					</Accordion.Panel>
				</Accordion.Item>
			</Accordion>
		</>
	)
}