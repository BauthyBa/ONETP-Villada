// Debug script para verificar autenticación
// Ejecuta esto en la consola del navegador

console.log('🔍 Debugging Authentication...');

// Verificar token en localStorage
const token = localStorage.getItem('access_token');
console.log('📦 Token en localStorage:', token ? '✅ Existe' : '❌ No existe');

if (token) {
    console.log('🔑 Token:', token.substring(0, 20) + '...');
    
    // Verificar si el token es válido
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
    .then(data => {
        console.log('✅ Usuario autenticado:', data);
    })
    .catch(error => {
        console.log('❌ Error de autenticación:', error.message);
        console.log('💡 Solución: Hacer login nuevamente');
    });
} else {
    console.log('💡 Solución: Hacer login para obtener token');
}

// Función para hacer login directo
async function directLogin() {
    console.log('🔐 Intentando login directo...');
    
    try {
        const response = await fetch('https://onetp-backend.onrender.com/direct-login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@tourpackages.com',
                password: 'admin1234'
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Login exitoso:', data);
            
            // Guardar token en localStorage
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            
            console.log('💾 Token guardado en localStorage');
            console.log('🔄 Recarga la página para aplicar el token');
            
            return data.access;
        } else {
            console.log('❌ Error en login:', data);
        }
    } catch (error) {
        console.log('❌ Error de red:', error);
    }
}

// Función para verificar admin
async function checkAdmin() {
    console.log('👤 Verificando usuario admin...');
    
    try {
        const response = await fetch('https://onetp-backend.onrender.com/verify-admin/');
        const data = await response.json();
        
        console.log('📋 Estado del admin:', data);
        return data;
    } catch (error) {
        console.log('❌ Error verificando admin:', error);
    }
}

// Función para crear admin
async function createAdmin() {
    console.log('👤 Creando usuario admin...');
    
    try {
        const response = await fetch('https://onetp-backend.onrender.com/create-admin/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        
        console.log('📋 Resultado de crear admin:', data);
        return data;
    } catch (error) {
        console.log('❌ Error creando admin:', error);
    }
}

// Verificar configuración de API
console.log('🌐 API URL configurada:', process.env.REACT_APP_API_URL || 'No configurada');

// Exponer funciones globalmente
window.debugAuth = {
    directLogin,
    checkAdmin,
    createAdmin
};

console.log('🛠️ Funciones disponibles:');
console.log('- debugAuth.directLogin() - Hacer login directo');
console.log('- debugAuth.checkAdmin() - Verificar admin');
console.log('- debugAuth.createAdmin() - Crear admin'); 