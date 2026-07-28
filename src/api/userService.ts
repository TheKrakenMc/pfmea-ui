import axiosClient from './axiosClient';

export interface UserLookup {
  id: string;
  full_name?: string;
  email?: string;
  department?: string;
  role_name?: string;
}

export const userService = {
  lookup: async (): Promise<UserLookup[]> => {
    const response = await axiosClient.get('/users/lookup');
    return response.data;
  }
};
