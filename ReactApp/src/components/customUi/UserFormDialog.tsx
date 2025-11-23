import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import S3Upload from "@/components/S3Upload";
import type { User } from "@/apis/users/users.api";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  birthday: z.string().min(1, "Birthday is required"),
  age: z.number().int().min(10, "Age must be at least 10").max(150),
  gender: z.enum(["male", "female", "other"]),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  image: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  onSubmit: (data: any) => void;
};

export default function UserFormDialog({ open, onOpenChange, editingUser, onSubmit }: UserFormDialogProps) {
  const [imageUrl, setImageUrl] = useState("");
  
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName: "",
      age: 0,
      gender: "male",
      email: "",
      phone: "",
      birthday: "",
      image: "",
    },
  });

  useEffect(() => {
    if (editingUser) {
      setImageUrl(editingUser.image || "");
      form.reset({
        firstName: editingUser.firstname,
        lastName: editingUser.lastname,
        age: editingUser.age as any,
        gender: editingUser.gender as any,
        email: editingUser.email,
        phone: "",
        birthday: editingUser.birthdate ? editingUser.birthdate.split('T')[0] : "",
        image: editingUser.image || "",
      });
    } else {
      setImageUrl("");
      form.reset({
        firstName: "",
        lastName: "",
        age: 0,
        gender: "male",
        email: "",
        phone: "",
        birthday: "",
        image: "",
      });
    }
  }, [editingUser, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => onSubmit({ ...data, image: imageUrl }))} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="sm:col-span-2">
              <S3Upload
                value={imageUrl}
                onChange={setImageUrl}
                label="User Image"
              />
            </div>
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthday"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Birthday</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value || ""}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        if (e.target.value) {
                          const date = new Date(e.target.value);
                          const today = new Date();
                          let age = today.getFullYear() - date.getFullYear();
                          const monthDiff = today.getMonth() - date.getMonth();
                          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
                            age--;
                          }
                          form.setValue("age", age);
                        }
                      }}
                      max={format(new Date(Date.now() - 86400000), "yyyy-MM-dd")}
                      min="1900-01-01"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={(field.value as any) ?? ""}
                      disabled
                      readOnly
                      className="bg-muted dark:bg-gray-800"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange as any} value={(field.value as any) ?? "male"}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Phone (optional)</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="sm:col-span-2 mt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
