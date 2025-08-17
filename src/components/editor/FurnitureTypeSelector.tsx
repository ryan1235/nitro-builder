import { FC, useEffect, useState } from 'react';
import { EditorConfig } from '../../config';
import { Button, Card, CardBody, CardHeader, Flex } from '../../layout';

/**
 * Componente para selecionar o tipo de mobiliário
 */
export const FurnitureTypeSelector: FC = () => {
    const [selectedType, setSelectedType] = useState<number>(EditorConfig.getDefaultFurnitureType());

    // Lista de tipos de mobiliário disponíveis
    const furnitureTypes = [
        { id: 1, name: 'Tipo 1 - Básico', description: 'Mobiliário básico padrão' },
        { id: 2, name: 'Tipo 2 - Intermediário', description: 'Mobiliário com recursos avançados' },
        { id: 3, name: 'Tipo 3 - Avançado', description: 'Mobiliário com funcionalidades especiais' },
        { id: 4, name: 'Tipo 4 - Premium', description: 'Mobiliário premium exclusivo' },
        { id: 5, name: 'Tipo 5 - Evento', description: 'Mobiliário de eventos especiais' }
    ];

    useEffect(() => {
        // Atualiza o localStorage quando o tipo muda
        localStorage.setItem('furnitureType', selectedType.toString());
        console.log(`Tipo de mobiliário alterado para: ${selectedType}`);
    }, [selectedType]);

    const handleTypeChange = (typeId: number) => {
        setSelectedType(typeId);
    };

    const resetToDefault = () => {
        setSelectedType(EditorConfig.DEFAULT_FURNITURE_TYPE);
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <h3 className="text-lg font-semibold">Seletor de Tipo de Mobiliário</h3>
                <p className="text-sm text-gray-600">
                    Tipo atual: <span className="font-medium">{selectedType}</span>
                </p>
            </CardHeader>
            <CardBody>
                <Flex column className="gap-4">
                    {/* Seleção de tipos */}
                    <div className="space-y-2">
                        {furnitureTypes.map((type) => (
                            <div
                                key={type.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                    selectedType === type.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => handleTypeChange(type.id)}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-medium">{type.name}</div>
                                        <div className="text-sm text-gray-600">{type.description}</div>
                                    </div>
                                    {selectedType === type.id && (
                                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Botões de ação */}
                    <Flex className="gap-2">
                        <Button
                            onClick={resetToDefault}
                            color="dark"
                            size="sm"
                            className="flex-1"
                        >
                            Resetar para Padrão
                        </Button>
                    </Flex>

                    {/* Informações */}
                    <div className="text-xs text-gray-500 text-center">
                        O tipo selecionado será salvo automaticamente
                    </div>
                </Flex>
            </CardBody>
        </Card>
    );
};
