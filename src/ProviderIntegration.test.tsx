import {describe,it,expect,vi} from 'vitest';
import {render,screen} from '@testing-library/react';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {ThemeProvider} from './context/ThemeContext';
import './i18n/i18n';
import App from './App';

vi.mock('./api/axiosClient',()=>({default:{get:vi.fn().mockRejectedValue(new Error('No session')),post:vi.fn()}}));
describe('application provider integration',()=>{
 it('renders password login when no session exists',async()=>{
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
  window.history.replaceState(null,'','/login');
  render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><ThemeProvider><App/></ThemeProvider></QueryClientProvider>);
  const email=await screen.findByRole('textbox');expect(email).toHaveAttribute('type','email');
  expect(document.querySelector('input[type=password]')).toBeInTheDocument();
  expect(document.querySelector('input[placeholder="000000"]')).not.toBeInTheDocument();
 });
});
