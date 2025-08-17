import { FC, PropsWithChildren } from 'react';
import { EditorConfig } from '../config';
import { useFileUploader, useNitroBundle, useNitroUrlLoader } from '../hooks';
import { useIframeProtection } from '../hooks/useIframeProtection';
import { Flex } from '../layout';
import { EditorCanvas2Component } from './editor';
import { ActionButtonsComponent } from './editor/action-buttons';

export const NitroBuilderComponent: FC<PropsWithChildren<{}>> = props =>
{
    const { assetData = null } = useNitroBundle();
    const {} = useFileUploader();
    const {} = useNitroUrlLoader();
    const isValidOrigin = useIframeProtection();

    if (!isValidOrigin) {
        return null; // O hook já cuida de mostrar a mensagem de erro
    }

    return (
        <Flex
            column
            className="w-full fixed h-[100vh] bg-gray-300">
            <Flex
                className="z-10 w-full h-full overflow-hidden">
                <Flex
                    justifyContent="center"
                    className="z-10 w-full h-full overflow-hidden bg-black">
                    <EditorCanvas2Component />
                </Flex>
            </Flex>
            { assetData != null && !EditorConfig.shouldHideAllButtons() && (
                <>
                    <ActionButtonsComponent />
                </>
            )}
        </Flex>
    );
}
