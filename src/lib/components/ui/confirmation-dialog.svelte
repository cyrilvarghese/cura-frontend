<script lang="ts">
    import * as AlertDialog from "$lib/components/ui/alert-dialog";

    export let open = false;
    export let title: string;
    export let description: string;
    export let confirmText: string = "Confirm";
    export let cancelText: string = "Cancel";
    export let confirmClass: string = "bg-destructive";
    export let onConfirm: () => void;
    export let onCancel: () => void = () => {
        open = false;
    };
</script>

<AlertDialog.Root bind:open>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>{title}</AlertDialog.Title>
            <AlertDialog.Description>
                {description}
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel onclick={onCancel}
                >{cancelText}</AlertDialog.Cancel
            >
            <AlertDialog.Action
                class={confirmClass}
                onclick={() => {
                    onConfirm();
                    open = false;
                }}
            >
                {confirmText}
            </AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
