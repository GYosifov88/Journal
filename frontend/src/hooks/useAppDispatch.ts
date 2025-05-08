import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';

// Use this custom hook throughout your app instead of plain `useDispatch`
export const useAppDispatch = () => useDispatch<AppDispatch>(); 