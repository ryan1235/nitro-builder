import { useEffect, useState } from 'react';

export const useIframeProtection = () => {
    const [isValidOrigin, setIsValidOrigin] = useState(false);

    useEffect(() => {
        const checkOrigin = () => {
            try {
                // Verifica se está em um iframe
                if (window.self !== window.top) {
                    // Obtém o domínio do iframe pai
                    const parentOrigin = window.parent.location.origin;
                    // Lista de origens permitidas
                    const allowedOrigins = [
                        'https://habb2once.com.br',
                        'http://habb2once.com.br',
                        'http://localhost:3000',
                        'http://localhost:5173',
                        'http://127.0.0.1:3000',
                        'http://127.0.0.1:5173'
                    ];

                    // Verifica se a origem está na lista de permitidas
                    const isValid = allowedOrigins.includes(parentOrigin);
                    setIsValidOrigin(isValid);

                    if (!isValid) {
                        console.log('Origem bloqueada:', parentOrigin);
                        document.body.innerHTML = `
                            <div style="
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                background-color: #6A3B8F;
                                color: white;
                                font-family: Arial, sans-serif;
                                text-align: center;
                                padding: 20px;
                            ">
                                <div>
                                    <h1 style="font-size: 24px; margin-bottom: 16px;">Acesso Negado</h1>
                                    <p style="font-size: 16px;">
                                        Este aplicativo só pode ser acessado através do site habb2once.com.br ou localhost
                                    </p>
                                    <p style="font-size: 14px; margin-top: 10px; color: #ccc;">
                                        Origem detectada: ${parentOrigin}
                                    </p>
                                </div>
                            </div>
                        `;
                    }
                } else {
                    // Se não estiver em um iframe, permite o acesso direto
                    setIsValidOrigin(true);
                }
            } catch (error) {
                console.error('Erro ao verificar origem:', error);
                // Em caso de erro, permite o acesso
                setIsValidOrigin(true);
            }
        };

        checkOrigin();
    }, []);

    return isValidOrigin;
}; 
