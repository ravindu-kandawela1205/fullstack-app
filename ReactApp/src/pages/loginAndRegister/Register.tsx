import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import React from 'react';

import { useAuth } from '@/store/authStore';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  role: z.string().min(1, 'Please select a role'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const nav = useNavigate();
  const { register: registerUser, loading } = useAuth();
  const [successMessage, setSuccessMessage] = React.useState('');


  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', role: 'user' },
    mode: 'onSubmit',
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data.name, data.email, data.role);
       setSuccessMessage('Registration successful! Check your email for login credentials.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        nav('/login');
      }, 3000);
    } catch (err: any) {
      // Show backend error at top of form (and keep field errors if any)
      form.setError('root', { message: err?.message || 'Registration failed' });
    }
  };

  return (
    // <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
    //   <div className="p-3 space-y-3 bg-white border border-gray-200 rounded-lg shadow-md w-120 dark:border-gray-800 dark:bg-gray-900">
    //     <div className="text-center">
    //       <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
    //         Sign up
    //       </h2>
    //       <p className="mt-2 text-gray-600 dark:text-gray-400">
    //         Create your new account
    //       </p>
    //     </div>

    //     <Form {...form}>
    //       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
    //         {/* Top-level error (server) */}
    //         {form.formState.errors.root?.message && (
    //           <div className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded bg-red-50 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
    //             {form.formState.errors.root.message}
    //           </div>
    //         )}

    //         <FormField
    //           control={form.control}
    //           name="name"
    //           render={({ field }) => (
    //             <FormItem>
    //               <FormLabel>Full Name</FormLabel>
    //               <FormControl>
    //                 <Input
    //                   placeholder="Enter your full name"
    //                   disabled={loading}
    //                   {...field}
    //                 />
    //               </FormControl>
    //               <FormMessage />
    //             </FormItem>
    //           )}
    //         />

    //         <FormField
    //           control={form.control}
    //           name="email"
    //           render={({ field }) => (
    //             <FormItem>
    //               <FormLabel>Email</FormLabel>
    //               <FormControl>
    //                 <Input
    //                   type="email"
    //                   placeholder="Enter your email"
    //                   disabled={loading}
    //                   {...field}
    //                 />
    //               </FormControl>
    //               <FormMessage />
    //             </FormItem>
    //           )}
    //         />

    //         <FormField
    //           control={form.control}
    //           name="role"
    //           render={({ field }) => (
    //             <FormItem>
    //               <FormLabel>Role</FormLabel>
    //               <Select
    //                 onValueChange={field.onChange}
    //                 defaultValue={field.value}
    //               >
    //                 <FormControl>
    //                   <SelectTrigger>
    //                     <SelectValue placeholder="Select a role" />
    //                   </SelectTrigger>
    //                 </FormControl>
    //                 <SelectContent>
    //                   <SelectItem value="user">User</SelectItem>
    //                   <SelectItem value="admin">Admin</SelectItem>
    //                 </SelectContent>
    //               </Select>
    //               <FormMessage />
    //             </FormItem>
    //           )}
    //         />

    //         <Button type="submit" className="w-full" disabled={loading}>
    //           {loading ? 'Creating...' : 'Sign up'}
    //         </Button>
    //       </form>
    //     </Form>

    //     <div className="text-center">
    //       <p className="text-gray-600 dark:text-gray-400">
    //         Already have an account?{' '}
    //         <Link
    //           to="/login"
    //           className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
    //         >
    //           Sign in
    //         </Link>
    //       </p>
    //     </div>
    //   </div>
    // </div>
     <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-3 space-y-3 bg-white border border-gray-200 rounded-lg shadow-md w-120 dark:border-gray-800 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Sign up
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create your new account - Password will be sent to your email
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Success message */}
            {successMessage && (
              <div className="px-3 py-2 text-sm text-green-600 border border-green-200 rounded bg-green-50 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                {successMessage}
              </div>
            )}

            {/* Error message */}
            {form.formState.errors.root?.message && (
              <div className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded bg-red-50 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {form.formState.errors.root.message}
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ←←← NEW: Info message about auto-generated password */}
            <div className="px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              📧 A secure password will be automatically generated and sent to your email
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Sign up'}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
