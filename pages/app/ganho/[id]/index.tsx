import { Forms } from "@/components/Forms"
import { FinanceiroAttributes, FinanceiroEdit } from "@/components/Financeiro"

import TextareaAutosize from "react-textarea-autosize";
import toast from "react-hot-toast";
import useSWR, { mutate } from "swr";
import { useDebounce } from "use-debounce";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";

import Layout from "@/components/app/Layout";
import Loader from "@/components/app/Loader";
import LoadingDots from "@/components/app/loading-dots";
import { fetcher } from "@/lib/fetcher";
import { HttpMethod } from "@/types";

import type { ChangeEvent } from "react";

import type { WithSiteGanho } from "@/types";

interface GanhoData {
    name: string;
    valor: string;
    recebimento: string;
    pago: any;
}

export default function AddFinanceiroGanho() {
    const router = useRouter();

    // TODO: Undefined check redirects to error
    const { id: ganhoId } = router.query;

    const { data: ganho, isValidating } = useSWR<WithSiteGanho>(
        router.isReady && `/api/ganho?ganhoId=${ganhoId}`,
        fetcher,
        {
            dedupingInterval: 1000,
            onError: () => router.push("/"),
            revalidateOnFocus: false,
        }
    );

    const [savedState, setSavedState] = useState(
        ganho
            ? `Last saved at ${Intl.DateTimeFormat("en", { month: "short" }).format(
                new Date(ganho.updatedAt)
            )} ${Intl.DateTimeFormat("en", { day: "2-digit" }).format(
                new Date(ganho.updatedAt)
            )} ${Intl.DateTimeFormat("en", {
                hour: "numeric",
                minute: "numeric",
            }).format(new Date(ganho.updatedAt))}`
            : "Saving changes..."
    );

    const [data, setData] = useState<GanhoData>({
        name: "",
        valor: "",
        pago: "",
        recebimento: ""
    });

    useEffect(() => {
        if (ganho)
            setData({
                name: ganho.name ?? "",
                valor: ganho.valor ?? "",
                pago: ganho.pago ?? "",
                recebimento: ganho.recebimento ?? ""
            });
    }, [ganho]);

    const [debouncedData] = useDebounce(data, 1000);

    const saveChanges = useCallback(
        async (data: GanhoData) => {
            setSavedState("Saving changes...");

            try {
                const response = await fetch("/api/ganho", {
                    method: HttpMethod.PUT,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: ganhoId,
                        name: data.name,
                        valor: data.valor,
                        pago: data.pago,
                        recebimento: data.recebimento,
                    }),
                });

                if (response.ok) {
                    const responseData = await response.json();
                    setSavedState(
                        `Last save ${Intl.DateTimeFormat("en", { month: "short" }).format(
                            new Date(responseData.updatedAt)
                        )} ${Intl.DateTimeFormat("en", { day: "2-digit" }).format(
                            new Date(responseData.updatedAt)
                        )} at ${Intl.DateTimeFormat("en", {
                            hour: "numeric",
                            minute: "numeric",
                        }).format(new Date(responseData.updatedAt))}`
                    );
                } else {
                    setSavedState("Failed to save.");
                    toast.error("Failed to save");
                }
            } catch (error) {
                console.error(error);
            }
        },
        [ganhoId]
    );

    useEffect(() => {
        if (debouncedData.name) saveChanges(debouncedData);
    }, [debouncedData, saveChanges]);

    useEffect(() => {
        if (debouncedData.valor) saveChanges(debouncedData);
    }, [debouncedData, saveChanges]);

    useEffect(() => {
        if (debouncedData.pago) saveChanges(debouncedData);
    }, [debouncedData, saveChanges]);

    useEffect(() => {
        if (debouncedData.recebimento) saveChanges(debouncedData);
    }, [debouncedData, saveChanges]);


    const [publishing, setPublishing] = useState(false);
    const [pago, setPago] = useState(false)
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        function clickedSave(e: KeyboardEvent) {
            let charCode = String.fromCharCode(e.which).toLowerCase();

            if ((e.ctrlKey || e.metaKey) && charCode === "s") {
                e.preventDefault();
                saveChanges(data);
            }
        }

        window.addEventListener("keydown", clickedSave);

        return () => window.removeEventListener("keydown", clickedSave);
    }, [data, saveChanges]);



    async function publish() {
        setPublishing(true);
        setPago(true)
        if (pago) {
            setPago(false)
        }


        try {
            const response = await fetch(`/api/ganho`, {
                method: HttpMethod.PUT,
                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    id: ganhoId,
                    name: data.name,
                    valor: data.valor,
                    pago: data.pago,
                    recebimento: data.recebimento,
                    published: true,
                    subdomain: ganho?.site?.subdomain,
                    customDomain: ganho?.site?.customDomain,
                    slug: ganho?.slug,
                }),

            }
            );

            if (response.ok) {
                setPago(true),
                    mutate(`/api/ganho?ganhoId=${ganhoId}`);
                router.push(
                    `https://${ganho?.site?.subdomain}.vercel.pub/${ganho?.slug}`
                );
            }
        } catch (error) {
            console.error(error);
        } finally {
            setPublishing(false);
            setPago(false)
        }
    }

    if (isValidating)
        return (
            <Layout>
                <Loader />
            </Layout>
        );
    return (
        <FinanceiroEdit title={"Adicionar nova Ganho"} text={"Adicione um novo Ganho"} titlePage={"Detalhes do Ganho"}
            onChange1={(e: ChangeEvent<HTMLTextAreaElement>) => setData({
                ...data,
                name: (e.target as HTMLTextAreaElement).value,
            })} value1={data.name}
            onChange2={(e: ChangeEvent<HTMLTextAreaElement>) => setData({
                ...data,
                recebimento: (e.target as HTMLTextAreaElement).value,
            })} value2={data.recebimento}
            onChange3={(e: ChangeEvent<HTMLTextAreaElement>) => setData({
                ...data,
                valor: (e.target as HTMLTextAreaElement).value,
            })} value3={data.valor}
            onClick={async () => {
                await publish();
            }} onInput1={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setData({
                    ...data,
                    pago: (e.target as HTMLTextAreaElement).value,
                })
            } defaultValue1={data.pago}        >

            <Forms label={"Empresa"} type={"text"} placeholder={"Digite o nome da empresa"}
            />
        </FinanceiroEdit>
    )
}

