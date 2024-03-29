import { HStack } from "@chakra-ui/react"

import { Main } from "../Main"
import { ButtonSave } from "../Buttons"
import { CardMain } from "../Cards"
import { Forms } from "../Forms"
import { TitleCards } from "../Title"

interface EstoqueAttributesProps {
    title: string
    text: string
    name1?: any
    name2?: any
    name3?: any
    name4?: any
    name5?: any
    name6?: any
    name7?: any
    onChange1?: any
    onChange2?: any
    onChange3?: any
    onChange4?: any
    onChange5?: any
    onChange6?: any
    onChange7?: any
    value1?: any
    value2?: any
    value3?: any
    value4?: any
    value5?: any
    value6?: any
    value7?: any
    onClick?: any
}

export function EstoqueAttributes({ title, text, name1, name2, name3, name4, name5, name6, name7, onChange1, onChange2, onChange3, onChange5, onChange4, onChange6, onChange7, value1, value2, value3, value4, value5, value6, value7, onClick }: EstoqueAttributesProps) {
    return (
        <Main title={"Estoque"} w={"25%"} path={"/perfil.png"} altText={"Ícone do Denload"} tamh={51} tamw={56}>
            <CardMain radius={"18px"} spacing={5}>
                <TitleCards title={title} />
                <HStack spacing={6}>
                    <Forms label={"Nome"} type={"text"} placeholder={"Digite o seu nome"} name={name1} onChange={onChange1} value={value1} />
                    <Forms label={"Unidade"} type={"text"} placeholder={"Digite a unidade do produto"} name={name2} onChange={onChange2} value={value2} />
                </HStack>
                <HStack spacing={6}>
                    <Forms label={"Validade"} type={"text"} placeholder={"Digite a sua validade"} name={name3} onChange={onChange3} value={value3} />
                    <Forms label={"Data da Compra"} type={"text"} placeholder={"Digite a data da compra"} name={name4} onChange={onChange4} value={value4} />
                </HStack>
                <HStack spacing={6}>
                    <Forms label={"Mínimo do Produto"} type={"text"} placeholder={"Digite a quantidade mínima do produto"} name={name5} onChange={onChange5} value={value5} />
                    <Forms label={"Valor Unitário do Produto"} type={"text"} placeholder={"Digite o valor unitário do produto"} name={name6} onChange={onChange6} value={value6} />

                </HStack>
                <ButtonSave align="end" onClick={onClick} />
            </CardMain>
        </Main>

    )
}