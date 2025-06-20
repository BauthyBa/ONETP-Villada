// Script para debuggear axios y ver qué está pasando
// Ejecuta esto en la consola del navegador

console.log('🔍 Debugging Axios Configuration...');

// Verificar configuración de axios
console.log('🌐 Axios baseURL:', axios.defaults.baseURL);
console.log('🔑 Axios Authorization header:', axios.defaults.headers.common['Authorization']);

// Verificar token en localStorage
const token = localStorage.getItem('access_token');
console.log('📦 Token en localStorage:', token ? '✅ Existe' : '❌ No existe');

if (token) {
    console.log('🔑 Token:', token.substring(0, 20) + '...');
    
    // Verificar si el token está configurado correctamente en axios
    if (axios.defaults.headers.common['Authorization'] === `Bearer ${token}`) {
        console.log('✅ Token configurado correctamente en axios');
    } else {
        console.log('❌ Token NO configurado en axios');
        console.log('💡 Configurando token manualmente...');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Hacer una request de prueba
    console.log('🧪 Haciendo request de prueba...');
    axios.get('/api/v1/paquetes/')
        .then(response => {
            console.log('✅ Request exitosa:', response.status);
            console.log('📊 Datos recibidos:', response.data.length, 'paquetes');
        })
        .catch(error => {
            console.log('❌ Error en request:', error.response?.status);
            console.log('🔍 Detalles del error:', error.response?.data);
            console.log('🌐 URL intentada:', error.config?.url);
            console.log('🔑 Headers enviados:', error.config?.headers);
        });
} else {
    console.log('💡 No hay token. Necesitas hacer login.');
}

// Función para configurar token manualmente
function setTokenManually() {
    const token = localStorage.getItem('access_token');
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('✅ Token configurado manualmente');
        console.log('🔄 Recarga la página para aplicar los cambios');
        setTimeout(() => window.location.reload(), 1000);
    } else {
        console.log('❌ No hay token para configurar');
    }
}

// Función para hacer login y configurar token
async function loginAndConfigure() {
    console.log('🔐 Haciendo login y configurando token...');
    
    try {
        const response = await fetch('https://onetp-backend.onrender.com/direct-login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@tourpackages.com',
                password: 'admin1234'
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('access_token', data.access);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
            console.log('✅ Login exitoso y token configurado');
            console.log('🔄 Recargando página...');
            setTimeout(() => window.location.reload(), 1000);
        } else {
            console.log('❌ Error en login:', data);
        }
    } catch (error) {
        console.log('❌ Error:', error);
    }
}

// Exponer funciones
window.debugAxios = { setTokenManually, loginAndConfigure };
console.log('🛠️ Funciones disponibles:');
console.log('- debugAxios.setTokenManually() - Configurar token manualmente');
console.log('- debugAxios.loginAndConfigure() - Login y configurar token'); 