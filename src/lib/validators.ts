import { z } from "zod";

export const eventFormSchema = z.object({
  kvImageId: z.string().min(1, { message: "Selecione um KV." }),
  classTheme: z.string().min(3, { message: "Tema com no mínimo 3 caracteres." }),
  selectedTeacherIds: z.array(z.string()).min(1, { message: "Selecione ao menos um professor." }),
  date: z.string().min(1, { message: "Data obrigatória." }),
  time: z.string().min(1, { message: "Horário obrigatório." }),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
