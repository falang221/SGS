import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

export type School = {
  id: string;
  name: string;
};

export const useCurrentSchool = () => {
  const user = useAuthStore((state) => state.user);
  const tenantId = user?.tenantId;

  const schoolsQuery = useQuery({
    queryKey: ['tenant-schools', tenantId],
    queryFn: async () => {
      const { data } = await api.get<School[]>(`/school/tenant/${tenantId}`);
      return data;
    },
    enabled: !!tenantId,
  });

  const schools = schoolsQuery.data ?? [];
  const currentSchool = schools[0] ?? null;

  return {
    ...schoolsQuery,
    tenantId,
    schools,
    currentSchool,
    currentSchoolId: currentSchool?.id ?? null,
  };
};
