import { useEffect, useState } from 'react';

export const useIframeProtection = () => {
    const [isValidOrigin, setIsValidOrigin] = useState(false);

    useEffect(() => {
        const checkOrigin = () => {
            // Verifica se está em um iframe
            if (window.self !== window.top) {
                // Obtém o domínio do iframe pai
                const parentOrigin = window.parent.location.origin;
                // Verifica se o domínio é habbonce.com.br
                const isValid = parentOrigin === 'https://habb2once.com.br' || 
                              parentOrigin === 'http://habbon2ce.com.br';
                
                setIsValidOrigin(isValid);

                if (!isValid) {
                    // Se não for um domínio válido, redireciona ou mostra mensagem de erro
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
                                    Este aplicativo só pode ser acessado através do site habbonce.com.br
                                </p>
                            </div>
                        </div>
                    `;
                }
            } else {
                // Se não estiver em um iframe, também bloqueia o acesso
                setIsValidOrigin(false);
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
                                Este aplicativo só pode ser acessado através do site habbonce.com.br
                            </p>
                        </div>
                    </div>
                `;
            }
        };

        checkOrigin();
    }, []);

    return isValidOrigin;
}; 
