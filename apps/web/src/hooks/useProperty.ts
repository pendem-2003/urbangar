import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data } = await api.get(`/properties/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useToggleSave(propertyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post(`/properties/${propertyId}/save`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] })
    },
  })
}

export function useContactRequest(propertyId: string) {
  return useMutation({
    mutationFn: (data: { message?: string }) =>
      api.post(`/bookings/contact/${propertyId}`, data),
  })
}
