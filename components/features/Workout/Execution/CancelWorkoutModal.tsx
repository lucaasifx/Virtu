import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

interface CancelWorkoutModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function CancelWorkoutModal({ visible, onClose, onConfirm }: CancelWorkoutModalProps) {
    return (
        <ConfirmationModal
            visible={visible}
            title="Cancelar Treino?"
            message="Todo o progresso do treino atual será perdido. Tem certeza que deseja sair?"
            confirmText="Sim, cancelar"
            cancelText="Não, continuar"
            onClose={onClose}
            onConfirm={onConfirm}
        />
    );
}


