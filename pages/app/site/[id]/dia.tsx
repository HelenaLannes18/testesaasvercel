import { HStack, Stack } from "@chakra-ui/react"

import { Main } from "@/components/Main"
import { CardDia, CardMain } from "@/components/Cards"
import { TableMain } from "@/components/Table"
import { Pagination } from "@/components/Pagination"

import { ButtonAdd, ButtonPacientes } from "@/components/Buttons"

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";

import LoadingDots from "@/components/app/loading-dots";
import { fetcher } from "@/lib/fetcher";
import { HttpMethod } from "@/types";
import type { WithPacienteAgenda } from "@/types";
import type { Paciente, Agenda, Site, Ganho, Despesa } from "@prisma/client";
import Modal from "@/components/Modal";
import { Table, TableContainer, Tbody, Td, Tfoot, Th, Thead, Tr } from "@chakra-ui/react"
import { TitleCards, TitleCardsPacientes } from "@/components/Title"
import { Heading, Input, Button, InputGroup, InputLeftElement, Select } from "@chakra-ui/react"
import { ReactNode } from "react"
import { MdSearch } from "react-icons/md"
import { MdArrowForward } from "react-icons/md"
import { format, subMonths, subDays } from "date-fns";
import { Line, Pie } from "react-chartjs-2"

interface SiteAgendaData {
    ganhos: Array<Ganho>;
    despesas: Array<Despesa>;
    agendas: Array<Agenda>;
    pacientes: Array<Paciente>;
    site: Site | null;
    paciente: Paciente | null;
    children: ReactNode
}

interface DiaProps {
    data: any
}
//@ts-ignore
export default function Dia({ data }: DiaProps, { agendas, agenda, pacientes, children, }: SiteAgendaData) {

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Array<Paciente>>([]);

    useEffect(() => {
        // função que irá realizar a chamada da API
        const searchApi = async () => {
            const response = await fetch(`http://app.localhost:3000/api/paciente?search=${searchTerm}`);
            const iba = await response.json();
            setSearchResults(iba);
        }

        // chamando a função da API apenas se houver algum termo de pesquisa
        if (searchTerm) {
            searchApi();
        } else {
            setSearchResults(pacientes);
        }
    }, [searchTerm]);

    const [currentPage, setCurrentPage] = useState<number>(0);

    const handlePageClick = (data: any) => {
        setCurrentPage(data.selected);
    }

    const PER_PAGE = 1;
    const offset = currentPage * PER_PAGE;
    const pageCount = Math.ceil(data?.pacientes?.length / PER_PAGE);

    const items = data?.pacientes?.slice(offset, offset + PER_PAGE);


    const router = useRouter();
    const { id: pacienteId } = router.query;
    const { id: siteId } = router.query;
    const { id: agendaId } = router.query;


    const { data: agendasData } = useSWR<SiteAgendaData>(
        pacienteId && `/api/agenda?siteId=${siteId}`,
        fetcher,
        // {
        //     onSuccess: (data) => !data?.paciente && router.push("/"),
        // }
    );

    const { data: pacientesData } = useSWR<SiteAgendaData>(
        siteId && `/api/paciente?siteId=${siteId}`,
        fetcher,
        // {
        //     onSuccess: (data) => !data?.paciente && router.push("/"),
        // }
    );

    const { data: ganhosData } = useSWR<SiteAgendaData>(
        siteId && `/api/ganho?siteId=${siteId}`,
        fetcher,
        // {
        //     onSuccess: (data) => !data?.site && router.push("/"),
        // }
    );

    const { data: despesasData } = useSWR<SiteAgendaData>(
        siteId && `/api/despesa?siteId=${siteId}`,
        fetcher,
        // {
        //     onSuccess: (data) => !data?.site && router.push("/"),
        // }
    );

    const { data: settings, } = useSWR<WithPacienteAgenda>(
        `/api/agenda?agendaId=${agendaId}`,
        fetcher,
        // {
        //     onError: () => router.push("/"),
        //     revalidateOnFocus: false,
        // }
    );

    async function createAgenda(pacienteId: string) {
        try {
            const res = await fetch(`/api/agenda?pacienteId=${pacienteId}`, {
                method: HttpMethod.POST,
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                const data = await res.json();
                router.push(`/agenda/${data.agendaId}`);
            }
        } catch (error) {
            console.error(error);
        }
    }


    async function deleteAgenda(agendaId: string) {
        try {
            const response = await fetch(`/api/agenda?agendaId=${agenda.id}`, {
                method: HttpMethod.DELETE,
            });

            if (response.ok) {
                router.push(`/paciente/${settings?.paciente?.id}`);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const [selectedOption, setSelectedOption] = useState('')
    const [selectResults, setSelectResults] = useState<Array<Agenda>>([]);

    useEffect(() => {
        // função que irá realizar a chamada da API
        const selectApi = async () => {
            const response = await fetch(`http://app.localhost:0/api/agenda?orderBy=${selectedOption}`);
            const data = await response.json();
            setSelectResults(data);
        }

        // chamando a função da API apenas se houver algum termo de pesquisa
        if (selectedOption) {
            selectApi();
        } else {
            setSelectResults(agendas);
        }
    }, [selectedOption]);

    function handleOptionChange(event: any) {
        setSelectedOption(event.target.value)
    }




    return (
        <Main title={"Dia"} w={"45%"} path={"/dia.png"} altText={"Ícone do Denload"} tamh={51} tamw={56}>
            <Stack
                spacing={4}
            >
                <HStack
                    justify="start"
                    spacing={6}
                >
                    {ganhosData &&
                        (() => {
                            let totalGanhos = 0;

                            const currentDate = new Date();
                            let startDate = currentDate;
                            startDate = subDays(currentDate, 1);
                            const filteredGanhos = ganhosData.ganhos.filter((ganho) => {
                                const ganhoDate = new Date(ganho.createdAt);
                                return ganhoDate >= startDate && ganhoDate <= currentDate;
                            });
                            filteredGanhos.forEach((ganho) => {
                                //@ts-ignore
                                totalGanhos += +ganho.valor;
                            });



                            return (
                                <CardDia w={"20%"} path={"/ganho.png"} altText={"Ícone do Denload"} tamh={48} tamw={52} title={"Ganho do dia"} text={totalGanhos} />
                            )
                        })()
                    }

                    {despesasData &&
                        (() => {
                            let totalDespesas = 0;

                            const currentDate = new Date();
                            let startDate = currentDate;
                            startDate = subDays(currentDate, 1);
                            const filteredDespesas = despesasData.despesas.filter((despesa) => {
                                const despesaDate = new Date(despesa.createdAt);
                                return despesaDate >= startDate && despesaDate <= currentDate;
                            });
                            filteredDespesas.forEach((despesa) => {
                                //@ts-ignore
                                totalDespesas += +despesa.valor;
                            });



                            return (
                                <CardDia w={"20%"} path={"/despesa.png"} altText={"Ícone do Denload"} tamh={48} tamw={52} title={"Despesa do dia"} text={totalDespesas} />
                            )
                        })()
                    }

                    {despesasData && ganhosData &&
                        (() => {
                            let totalDespesas = 0;
                            let totalGanhos = 0;
                            let lucro = 0;

                            const currentDate = new Date();
                            let startDate = currentDate;
                            startDate = subDays(currentDate, 1);

                            const filteredDespesas = despesasData.despesas.filter((despesa) => {
                                const despesaDate = new Date(despesa.createdAt);
                                return despesaDate >= startDate && despesaDate <= currentDate;
                            });

                            const filteredGanhos = ganhosData.ganhos.filter((ganho) => {
                                const ganhoDate = new Date(ganho.createdAt);
                                return ganhoDate >= startDate && ganhoDate <= currentDate;
                            });

                            filteredDespesas.forEach((despesa) => {
                                //@ts-ignore
                                totalDespesas += +despesa.valor;
                            });

                            filteredGanhos.forEach((ganho) => {
                                //@ts-ignore
                                totalGanhos += +ganho.valor;
                            });

                            const lucroFunction = () => {
                                lucro = totalDespesas - totalGanhos
                                return lucro
                            }



                            return (
                                <CardDia w={"20%"} path={"/lucro.png"} altText={"Ícone do Denload"} tamh={48} tamw={52} title={"Lucro do dia"} text={lucroFunction()} />
                            )
                        })()
                    }




                </HStack>
                <CardMain radius={"18px"}>
                    <TableContainer>
                        <Stack spacing={6}>
                            <HStack
                                justify={"space-between"}
                            >
                                {children}
                                <HStack>
                                    <InputGroup>
                                        <InputLeftElement
                                            // eslint-disable-next-line react/no-children-prop
                                            children={<MdSearch size={"22px"} />}
                                        />
                                        <Input type='text' placeholder='Pesquisar' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                    </InputGroup>
                                    <Select variant='filled' placeholder='Ordenar por' >
                                        <option value="name">Nome</option>
                                        <option value="age">Idade</option>
                                        <option value="gender">Gênero</option>
                                    </Select>
                                    {searchTerm ? (
                                        <div>
                                            {searchResults.map((paciente) => (
                                                <div key={paciente.id}>{paciente.name}</div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div>
                                            {pacientesData?.pacientes.map((paciente) => (
                                                <div key={paciente.id}>{paciente.name}</div>
                                            ))}
                                        </div>
                                    )}

                                </HStack>

                            </HStack>
                            <Table>
                                <Thead>
                                    <Tr>

                                        <Th color={"#B5B7C0"} fontSize={"14px"} fontWeight={500}>Ações</Th>
                                        <Th color={"#B5B7C0"} fontSize={"14px"} fontWeight={500}>Nome do Paciente</Th>
                                        <Th textAlign={"start"} isNumeric color={"#B5B7C0"} fontSize={"14px"} fontWeight={500}>Horário</Th>
                                        <Th color={"#B5B7C0"} fontSize={"14px"} fontWeight={500}>Procedimento</Th>
                                        <Th color={"#B5B7C0"} fontSize={"14px"} fontWeight={500}>Dia</Th>
                                        <Th color={"#B5B7C0"} fontSize={"14px"} fontWeight={500}>Status</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>

                                    {agendasData && pacientesData ? (
                                        agendasData.agendas.length > 0 ? (
                                            agendasData.agendas.map((agenda) => {
                                                const paciente = pacientesData.pacientes.find(
                                                    (paciente) => paciente.id === paciente.id
                                                )

                                                return (
                                                    <Tr key={agenda.id}>
                                                        <Td color={"#474749"} fontSize={"14px"}>
                                                            <ButtonPacientes onClick={undefined} href={""} />
                                                        </Td>

                                                        <>

                                                            <Td color={"#474749"} fontSize={"14px"}>
                                                                <Link href={`/paciente/${paciente?.id}`}>{paciente?.name}</Link>
                                                            </Td>
                                                            <Td textAlign={"start"} isNumeric color={"#474749"} fontSize={"14px"}>{agenda.horario}</Td>
                                                            <Td color={"#474749"} fontSize={"14px"}>{agenda.dia}</Td>
                                                            <Td color={"#474749"} fontSize={"14px"}>{agenda.dia}</Td>
                                                            <Td color={"#474749"} fontSize={"14px"}>{agenda.dia}</Td>
                                                        </>
                                                    </Tr>
                                                )
                                            })
                                        ) : (
                                            <>
                                                <p className="text-2xl font-cal text-gray-600">
                                                    Sem dados ainda.
                                                </p>
                                            </>
                                        )
                                    ) : (
                                        <p>Carregando..</p>
                                    )}


                                </Tbody>
                                <Tfoot>
                                    <Tr>
                                    </Tr>
                                </Tfoot>
                            </Table>

                        </Stack>
                    </TableContainer>
                </CardMain>
            </Stack>

        </Main>
    )
}