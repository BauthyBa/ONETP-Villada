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

// Verificar configuración de API
console.log('🌐 API URL configurada:', process.env.REACT_APP_API_URL || 'No configurada'); 