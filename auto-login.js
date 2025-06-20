// Script de login automático para el frontend
// Ejecuta esto en la consola del navegador

console.log('🚀 Iniciando login automático...');

async function autoLogin() {
    try {
        // Paso 1: Verificar si el admin existe
        console.log('👤 Verificando usuario admin...');
        const adminResponse = await fetch('https://onetp-backend.onrender.com/verify-admin/');
        const adminData = await adminResponse.json();
        
        if (!adminResponse.ok || adminData.message?.includes('no existe')) {
            console.log('👤 Admin no existe, creándolo...');
            const createResponse = await fetch('https://onetp-backend.onrender.com/create-admin/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const createData = await createResponse.json();
            console.log('✅ Admin creado:', createData);
        } else {
            console.log('✅ Admin existe:', adminData);
        }
        
        // Paso 2: Hacer login
        console.log('🔐 Haciendo login...');
        const loginResponse = await fetch('https://onetp-backend.onrender.com/direct-login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@tourpackages.com',
                password: 'admin1234'
            })
        });
        
        const loginData = await loginResponse.json();
        
        if (loginResponse.ok) {
            console.log('✅ Login exitoso!');
            
            // Paso 3: Guardar token
            localStorage.setItem('access_token', loginData.access);
            localStorage.setItem('refresh_token', loginData.refresh);
            
            console.log('💾 Token guardado en localStorage');
            console.log('🔑 Token:', loginData.access.substring(0, 20) + '...');
            
            // Paso 4: Verificar que el token funciona
            console.log('🔍 Verificando token...');
            const verifyResponse = await fetch('https://onetp-backend.onrender.com/api/v1/auth/me/', {
                headers: {
                    'Authorization': `Bearer ${loginData.access}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (verifyResponse.ok) {
                const userData = await verifyResponse.json();
                console.log('✅ Token válido, usuario:', userData);
                console.log('🎉 ¡Login completado exitosamente!');
                console.log('🔄 Recarga la página para aplicar los cambios');
                
                // Recargar automáticamente después de 2 segundos
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                
                return true;
            } else {
                console.log('❌ Token no válido');
                return false;
            }
        } else {
            console.log('❌ Error en login:', loginData);
            return false;
        }
        
    } catch (error) {
        console.log('❌ Error:', error);
        return false;
    }
}

// Ejecutar login automático
autoLogin().then(success => {
    if (success) {
        console.log('🎯 Login automático completado');
    } else {
        console.log('💥 Login automático falló');
    }
});

// Exponer función globalmente
window.autoLogin = autoLogin; 