import { useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import Modal from '@/Layouts/Modal';
import { useState } from 'react';
import { formatThousands, parseNumericInput } from '@/utils/currency';

interface CreateBookFormData {
    name: string;
    description: string;
    budget?: number;
}

interface CreateBookModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateBookModal({ isOpen, onClose }: CreateBookModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm<CreateBookFormData>({
        name: '',
        description: '',
        budget: undefined,
    });

    const [budgetDisplay, setBudgetDisplay] = useState('');

    const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseNumericInput(e.target.value);
        setData('budget', value ? Number(value) : undefined);
        setBudgetDisplay(formatThousands(value));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('books.store'), {
            onSuccess: () => {
                reset();
                setBudgetDisplay('');
                onClose();
                router.reload({ only: ['userBooks'] });
            }
        });
    };

    const handleClose = () => {
        reset();
        setBudgetDisplay('');
        onClose();
    };

    const inputClasses = (hasError: boolean) =>
        `input input-bordered w-full focus:outline-none ${hasError ? 'input-error' : ''}`;

    const textareaClasses = (hasError: boolean) =>
        `textarea textarea-bordered w-full focus:outline-none max-h-24 ${hasError ? 'textarea-error' : ''}`;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create Book" showCloseButton={false} size="small">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Book Name */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Book Name</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="e.g: Family Budget 2024"
                            className={`${inputClasses(!!errors.name)} pl-10`}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 z-[1]" size={18} />
                    </div>
                    {errors.name && <label className="label"><span className="label-text-alt text-error">{errors.name}</span></label>}
                </div>

                {/* Description */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Description</span>
                    </label>
                    <textarea
                        className={textareaClasses(!!errors.description)}
                        placeholder="Brief description of this financial book..."
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        rows={3}
                    />
                    {errors.description && <label className="label"><span className="label-text-alt text-error">{errors.description}</span></label>}
                </div>

                {/* Budget */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Budget</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Enter budget amount"
                            className={`${inputClasses(!!errors.budget)} pl-10`}
                            value={budgetDisplay}
                            onChange={handleBudgetChange}
                        />
                        <span className="absolute left-3 top-1/2 text-sm transform -translate-y-1/2 text-base-content/60 z-[1]">Rp</span>
                    </div>
                    {errors.budget && <label className="label"><span className="label-text-alt text-error">{errors.budget}</span></label>}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-8">
                    <button type="button" className="btn btn-ghost" onClick={handleClose}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={processing}>
                        {processing && <span className="loading loading-spinner loading-sm"></span>}
                        Create
                    </button>
                </div>
            </form>
        </Modal>
    );
}
