import { FC, PropsWithChildren } from 'react';
import { useFileUploader, useNitroBundle, useNitroUrlLoader } from '../hooks';
import { Flex } from '../layout';
import { EditorCanvas2Component } from './editor';
import { ActionButtonsComponent } from './editor/action-buttons';

export const NitroBuilderComponent: FC<PropsWithChildren<{}>> = props =>
{
    const { assetData = null } = useNitroBundle();
    const {} = useFileUploader();
    const {} = useNitroUrlLoader();

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
            { assetData != null && (
                <>
                    <ActionButtonsComponent />
                </>
            )}
        </Flex>
    );
}
