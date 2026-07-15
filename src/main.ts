import { mount } from 'svelte';
import './styles/App.css';
import './styles/manga.css';
import App from './App.svelte';

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
