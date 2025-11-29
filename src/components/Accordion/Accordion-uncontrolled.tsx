import { Accordion } from './accordion';

export default function AccordionUncontrolled() {
	return (
		<Accordion allowMultiple={true} defaultExpanded={['item-01']}>
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
	)
}