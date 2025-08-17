import { FC } from 'react';
import { EditorConfig } from '../../../config';
import { useLanguage } from '../../../hooks';
import { Button, Flex, Label } from '../../../layout';

export const ActionButtonsComponent: FC<{}> = () => {
    const { localizeText } = useLanguage();

    // Verifica se deve esconder todos os botões
    if (EditorConfig.shouldHideAllButtons()) {
        return null;
    }

    return (
        <Flex
            column
            className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 gap-2">
            <Flex
                className="w-full gap-4">
                <Button
                    size="lg"
                    color="default"
                    className="flex-1 h-14">
                    <Flex
                        column
                        className="items-center">
                        <span className="text-lg">Salvar</span>
                        <Label className="text-xs text-gray-500">Salvar todas as alterações</Label>
                    </Flex>
                </Button>
                <Button
                    size="lg"
                    color="dark"
                    className="flex-1 h-14">
                    <Flex
                        column
                        className="items-center">
                        <span className="text-lg">Exportar</span>
                        <Label className="text-xs text-gray-500">Exportar para arquivo</Label>
                    </Flex>
                </Button>
            </Flex>
        </Flex>
    );
}; 
