import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/apis/users/users.api";

export function useUsersQuery(page: number, pageSize: number) {
  return useQuery({
    queryKey: ["users", page, pageSize],
    queryFn: () => getUsers(page, pageSize),
  });
}
