import { z } from "zod";

const EndpointSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.number(),
});

export type EndpointProps = z.infer<typeof EndpointSchema>;

export class Endpoint implements EndpointProps {
  id: string;
  name: string;
  value: number;

  constructor(props: EndpointProps) {
    this.id = props.id;
    this.name = props.name;
    this.value = props.value;
  }
}