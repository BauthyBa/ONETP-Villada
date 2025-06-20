// Script para verificar el usuario actual y sus permisos
// Ejecuta esto en la consola del navegador

console.log('🔍 Verificando usuario actual...');

// Verificar token en localStorage
const token = localStorage.getItem('access_token');
console.log('📦 Token en localStorage:', token ? '✅ Existe' : '❌ No existe');

if (token) {
    console.log('🔑 Token:', token.substring(0, 20) + '...');
    
    // Verificar usuario actual
    fetch('https://onetp-backend.onrender.com/api/v1/auth/me/', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('🔍 Status de /auth/me/:', response.status);
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Token inválido');
        }
    })
    .then(user => {
        console.log('👤 Usuario actual:', user);
        console.log('🎭 Tipo de usuario:', user.tipo_usuario);
        console.log('🔐 Es admin?', user.tipo_usuario === 'admin');
        
        // Verificar si puede acceder a endpoints de admin
        return Promise.all([
            fetch('https://onetp-backend.onrender.com/api/v1/paquetes/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }),
            fetch('https://onetp-backend.onrender.com/api/v1/ventas/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }),
            fetch('https://onetp-backend.onrender.com/api/v1/usuarios/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
        ]);
    })
    .then(responses => {
        console.log('🔍 Resultados de endpoints de admin:');
        console.log('- /paquetes/:', responses[0].status);
        console.log('- /ventas/:', responses[1].status);
        console.log('- /usuarios/:', responses[2].status);
        
        if (responses[0].status === 401 || responses[1].status === 401 || responses[2].status === 401) {
            console.log('❌ El usuario actual NO tiene permisos de admin');
            console.log('💡 Solución: Hacer login con el usuario admin');
        } else {
            console.log('✅ El usuario actual SÍ tiene permisos de admin');
        }
    })
    .catch(error => {
        console.log('❌ Error:', error.message);
    });
} else {
    console.log('💡 No hay token. Necesitas hacer login.');
}

// Función para hacer logout
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    console.log('🚪 Logout completado');
    window.location.reload();
}

// Función para hacer login como admin
async function loginAsAdmin() {
    console.log('🔐 Haciendo login como admin...');
    
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
            localStorage.setItem('refresh_token', data.refresh);
            console.log('✅ Login como admin exitoso');
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
window.checkCurrentUser = { logout, loginAsAdmin };
console.log('🛠️ Funciones disponibles:');
console.log('- checkCurrentUser.logout() - Hacer logout');
console.log('- checkCurrentUser.loginAsAdmin() - Login como admin'); 