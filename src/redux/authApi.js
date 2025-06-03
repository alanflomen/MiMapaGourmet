import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    login: builder.mutation({
      async queryFn({ email, password }) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
          };
          return { data: user };
        } catch (error) {
          return { error: { message: error.message } };
        }
      },
    }),
    signup: builder.mutation({  
      async queryFn({ email, password }) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
          };
          return { data: user };
        } catch (error) {
          return { error: { message: error.message } };
        }
      },
    }),
  }),
});

export const { useLoginMutation, useSignupMutation } = authApi;
