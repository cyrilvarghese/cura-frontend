import type { ColumnDef } from "@tanstack/table-core";
import { renderComponent } from "$lib/components/ui/data-table";
import ArrowUpDown from "lucide-svelte/icons/arrow-up-down";
import { Button } from "$lib/components/ui/button";

type CaseReview = {
    title: string;
    docLink: string;
    status: string;
    commentCount: number;
    submittedDate: string;
};

export const columns: ColumnDef<CaseReview>[] = [
    {
        accessorKey: "sno",
        header: ({ column }) => {
            return renderComponent(Button, {
                variant: "ghost",
                onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
                children: [
                    "S.No",
                    renderComponent(ArrowUpDown, { class: "ml-2 h-4 w-4" })
                ]
            });
        },
    },
    {
        accessorKey: "title",
        header: ({ column }) => {
            return renderComponent(Button, {
                variant: "ghost",
                onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
                children: [
                    "Title",
                    renderComponent(ArrowUpDown, { class: "ml-2 h-4 w-4" })
                ]
            });
        },
    },
    {
        accessorKey: "commentCount",
        header: ({ column }) => {
            return renderComponent(Button, {
                variant: "ghost",
                onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
                children: [
                    "Comments",
                    renderComponent(ArrowUpDown, { class: "ml-2 h-4 w-4" })
                ]
            });
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            return renderComponent(Button, {
                variant: "ghost",
                onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
                children: [
                    "Status",
                    renderComponent(ArrowUpDown, { class: "ml-2 h-4 w-4" })
                ]
            });
        },
    },
    {
        accessorKey: "actions",
        header: "Actions",
        enableSorting: false,
    },
    {
        accessorKey: "submittedDate",
        header: ({ column }) => {
            return renderComponent(Button, {
                variant: "ghost",
                onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
                children: [
                    "Last Updated On",
                    renderComponent(ArrowUpDown, { class: "ml-2 h-4 w-4" })
                ]
            });
        },
    },
]; 