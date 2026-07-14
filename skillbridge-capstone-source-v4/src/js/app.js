import '../styles/main.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { showConfigWarnings } from './config.js';
import { renderNav } from './nav.js';

showConfigWarnings();
await renderNav();
