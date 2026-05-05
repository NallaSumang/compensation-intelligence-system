import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// 1. Force Coercion: Browser inputs are strings; this forces them to numbers BEFORE validation.
const formSchema = z.object({
  companyRaw: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  level: z.string().min(1, "Level is required"),
  location: z.string().min(1, "Location is required"),
  yoe: z.coerce.number().min(0, "YOE must be at least 0"),
  baseSalary: z.coerce.number().positive("Base salary is required"),
  bonus: z.coerce.number().nonnegative().default(0),
  stock: z.coerce.number().nonnegative().default(0),
});

// 2. Explicitly extract the type for the form
type FormValues = z.infer<typeof formSchema>;

export function SalaryForm() {
  // 3. Pass the generic <FormValues> to useForm. This kills the 'unknown' error.
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyRaw: "",
      role: "",
      level: "",
      location: "",
      yoe: 0,
      baseSalary: 0,
      bonus: 0,
      stock: 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    // Your submission logic here...
  };
  
  // ... rest of your component
}
