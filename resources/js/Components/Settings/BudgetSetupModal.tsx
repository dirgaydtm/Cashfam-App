import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { X, DollarSign, Target, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';

import type { FinancialBook } from '@/types';

interface BudgetSetupFormData {
    monthly_budget: number;
    budget_period: 'monthly' | 'weekly' | 'yearly';
    budget_categories: { [key: string]: number };
    alert_threshold: number; // Percentage (e.g., 80 = 80%)
    enable_alerts: boolean;
}

interface BudgetSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    book: FinancialBook | null;
}

const defaultCategories = [
    'Groceries',
    'Utilities',
    'Transportation',
    'Entertainment',
    'Healthcare',
    'Dining',
    'Shopping',
    'Other'
];

export default function BudgetSetupModal({ isOpen, onClose, book }: BudgetSetupModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm<BudgetSetupFormData>({
        monthly_budget: book?.budget || 0,
        budget_period: 'monthly',
        budget_categories: {},
        alert_threshold: 80,
        enable_alerts: true,
    });

    const [step, setStep] = useState<'basic' | 'categories' | 'alerts'>('basic');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!book) return;

        // For now, just log the data since we're using dummy data
        console.log('Setting up budget:', {
            ...data,
            book_id: book.id,
        });

        // In real implementation:
        // post(route('books.budget.setup', book.id), {
        //     onSuccess: () => {
        //         reset();
        //         onClose();
        //     }
        // });

        // For demo, just reset and close
        reset();
        onClose();
    };

    const handleClose = () => {
        reset();
        setStep('basic');
        onClose();
    };

    const nextStep = () => {
        if (step === 'basic') setStep('categories');
        else if (step === 'categories') setStep('alerts');
    };

    const prevStep = () => {
        if (step === 'alerts') setStep('categories');
        else if (step === 'categories') setStep('basic');
    };

    const updateCategoryBudget = (category: string, amount: number) => {
        setData('budget_categories', {
            ...data.budget_categories,
            [category]: amount
        });
    };

    const getTotalCategoryBudget = () => {
        return Object.values(data.budget_categories).reduce((sum, amount) => sum + (amount || 0), 0);
    };

    const getRemainingBudget = () => {
        return data.monthly_budget - getTotalCategoryBudget();
    };

    if (!isOpen || !book) return null;

    const currencySymbol = 'Rp';

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-lg">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-xl text-base-content">Budget Setup</h3>
                        <p className="text-sm text-base-content/60">
                            Set up monthly budget for {book.name}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="btn btn-sm btn-circle btn-ghost"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="steps steps-horizontal mb-6 w-full">
                    <div className={`step ${step === 'basic' ? 'step-primary' : step === 'categories' || step === 'alerts' ? 'step-primary' : ''}`}>
                        Basic Setup
                    </div>
                    <div className={`step ${step === 'categories' ? 'step-primary' : step === 'alerts' ? 'step-primary' : ''}`}>
                        Categories
                    </div>
                    <div className={`step ${step === 'alerts' ? 'step-primary' : ''}`}>
                        Alerts
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {step === 'basic' && (
                        <div className="space-y-6">
                            {/* Total Monthly Budget */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium flex items-center gap-2">
                                        <Target size={16} />
                                        Monthly Budget
                                    </span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className={`input input-bordered w-full pl-10 ${errors.monthly_budget ? 'input-error' : ''}`}
                                        placeholder="0.00"
                                        value={data.monthly_budget || ''}
                                        onChange={(e) => setData('monthly_budget', Number(e.target.value))}
                                        required
                                    />
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60">
                                        {currencySymbol}
                                    </span>
                                </div>
                                {errors.monthly_budget && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.monthly_budget}</span>
                                    </label>
                                )}
                                <label className="label">
                                    <span className="label-text-alt">
                                        This will be your total spending limit for the month
                                    </span>
                                </label>
                            </div>

                            {/* Budget Period */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium flex items-center gap-2">
                                        <Calendar size={16} />
                                        Budget Period
                                    </span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['weekly', 'monthly', 'yearly'] as const).map((period) => (
                                        <button
                                            key={period}
                                            type="button"
                                            className={`btn btn-sm ${data.budget_period === period ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setData('budget_period', period)}
                                        >
                                            {period.charAt(0).toUpperCase() + period.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Current Spending Preview */}
                            {book.budget && (
                                <div className="alert alert-info">
                                    <div className="text-sm">
                                        <p className="font-medium">Current Setup</p>
                                        <p>Your book currently has a budget of {currencySymbol}{book.budget.toLocaleString()}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'categories' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h4 className="font-semibold text-lg">Category Budgets</h4>
                                <p className="text-sm text-base-content/60">
                                    Allocate your {currencySymbol}{data.monthly_budget.toLocaleString()} budget across categories (optional)
                                </p>
                            </div>

                            {/* Budget Allocation */}
                            <div className="space-y-3">
                                {defaultCategories.map((category) => (
                                    <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-base-200">
                                        <span className="font-medium">{category}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-base-content/60">{currencySymbol}</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="input input-bordered input-sm w-20 text-right"
                                                placeholder="0"
                                                value={data.budget_categories[category] || ''}
                                                onChange={(e) => updateCategoryBudget(category, Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Budget Summary */}
                            <div className="card bg-base-200">
                                <div className="card-body p-4">
                                    <div className="flex justify-between items-center">
                                        <span>Total Allocated:</span>
                                        <span className="font-bold">{currencySymbol}{getTotalCategoryBudget().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Remaining:</span>
                                        <span className={`font-bold ${getRemainingBudget() < 0 ? 'text-error' : 'text-success'}`}>
                                            {currencySymbol}{getRemainingBudget().toLocaleString()}
                                        </span>
                                    </div>
                                    {getRemainingBudget() < 0 && (
                                        <div className="alert alert-error mt-2">
                                            <AlertTriangle size={16} />
                                            <span className="text-sm">Category budgets exceed total budget!</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'alerts' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h4 className="font-semibold text-lg">Budget Alerts</h4>
                                <p className="text-sm text-base-content/60">
                                    Get notified when spending approaches your budget limits
                                </p>
                            </div>

                            {/* Enable Alerts */}
                            <div className="form-control">
                                <label className="cursor-pointer label">
                                    <span className="label-text font-medium">Enable Budget Alerts</span>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={data.enable_alerts}
                                        onChange={(e) => setData('enable_alerts', e.target.checked)}
                                    />
                                </label>
                            </div>

                            {data.enable_alerts && (
                                <>
                                    {/* Alert Threshold */}
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium">Alert Threshold</span>
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                min="50"
                                                max="95"
                                                step="5"
                                                className="range range-primary flex-1"
                                                value={data.alert_threshold}
                                                onChange={(e) => setData('alert_threshold', Number(e.target.value))}
                                            />
                                            <span className="badge badge-primary">{data.alert_threshold}%</span>
                                        </div>
                                        <label className="label">
                                            <span className="label-text-alt">
                                                Get notified when spending reaches {data.alert_threshold}% of budget
                                            </span>
                                        </label>
                                    </div>

                                    {/* Alert Preview */}
                                    <div className="card bg-warning/10 border border-warning/20">
                                        <div className="card-body p-4">
                                            <h5 className="font-semibold text-warning">Preview Alert</h5>
                                            <p className="text-sm">
                                                ⚠️ You've spent {currencySymbol}{Math.round(data.monthly_budget * (data.alert_threshold / 100)).toLocaleString()}
                                                ({data.alert_threshold}%) of your {currencySymbol}{data.monthly_budget.toLocaleString()} monthly budget.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="modal-action">
                        {step !== 'basic' && (
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={prevStep}
                            >
                                Previous
                            </button>
                        )}

                        {step === 'basic' && (
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={handleClose}
                            >
                                Cancel
                            </button>
                        )}

                        {step !== 'alerts' ? (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={nextStep}
                                disabled={!data.monthly_budget || data.monthly_budget <= 0}
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={processing || getRemainingBudget() < 0}
                            >
                                {processing && <span className="loading loading-spinner loading-sm"></span>}
                                Setup Budget
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
