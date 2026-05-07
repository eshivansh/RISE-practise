const user = JSON.parse(localStorage.getItem('rise_user'));
if (!user) location.href = 'login.html';

const firstName = user.name.split(' ')[0];
const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

document.getElementById('username').textContent = firstName;
document.getElementById('sidebar-username').textContent = user.name;
document.getElementById('user-avatar').textContent = initials;

function logout() {
    localStorage.removeItem('rise_loggedIn');
    location.href = 'login.html';
}
