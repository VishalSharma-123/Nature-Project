import { login, logout } from './login';
import { displayMap } from './map';
import { updateSettings } from './updateSettings.js';
import '@babel/polyfill';

const mapElement = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

if (mapElement) {
  const tourLocations = JSON.parse(mapElement.dataset.locations);
  const tourStartLocation = JSON.parse(mapElement.dataset.startLocation);
  displayMap(tourLocations, tourStartLocation);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(email, password);
    e.preventDefault();
    login(email, password);
  });
}

if (logOutBtn) {
  console.log('hellp');
  logOutBtn.addEventListener('click', logout);
}

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    updateSettings({ name, email }, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');
  });
}
