import { useState, useEffect } from 'react';
import {
    Briefcase, Home, GraduationCap, Dumbbell, ShoppingCart, Plane,
    Gamepad2, Music, Book, Lightbulb, Star, Flame,
    Laptop, Palette, Coins, Stethoscope, Utensils, Car,
    Plus, Trash2, X, FolderKanban
} from 'lucide-react';
import { apiService } from '../services/api';
import { Category, CreateCategoryDto } from '../types';
import ConfirmModal from '../components/ConfirmModal';
import './Categories.css';

const PRESET_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef',
    '#f43f5e', '#64748b'
];

// Map of icon names to components
const ICON_MAP: Record<string, any> = {
    'Briefcase': Briefcase, 'Home': Home, 'GraduationCap': GraduationCap,
    'Dumbbell': Dumbbell, 'ShoppingCart': ShoppingCart, 'Plane': Plane,
    'Gamepad2': Gamepad2, 'Music': Music, 'Book': Book,
    'Lightbulb': Lightbulb, 'Star': Star, 'Flame': Flame,
    'Laptop': Laptop, 'Palette': Palette, 'Coins': Coins,
    'Stethoscope': Stethoscope, 'Utensils': Utensils, 'Car': Car
};

const PRESET_ICONS = Object.keys(ICON_MAP);

// Helper to render icon from string (handling legacy emojis)
export const renderCategoryIcon = (iconName: string, size = 20) => {
    // Legacy emoji mapping
    const emojiMap: Record<string, string> = {
        '💼': 'Briefcase', '🏠': 'Home', '🎓': 'GraduationCap', '💪': 'Dumbbell',
        '🛒': 'ShoppingCart', '✈️': 'Plane', '🎮': 'Gamepad2', '🎵': 'Music',
        '📚': 'Book', '💡': 'Lightbulb', '⭐': 'Star', '🔥': 'Flame',
        '💻': 'Laptop', '🎨': 'Palette', '💰': 'Coins', '🏥': 'Stethoscope',
        '🍽️': 'Utensils', '🚗': 'Car'
    };

    const mappedName = emojiMap[iconName] || iconName;
    const IconComponent = ICON_MAP[mappedName];

    if (IconComponent) {
        return <IconComponent size={size} />;
    }
    // Fallback for unmapped emojis or text
    return <span>{iconName}</span>;
};

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });
    const [newCategory, setNewCategory] = useState<CreateCategoryDto>({
        name: '',
        color: PRESET_COLORS[0],
        icon: PRESET_ICONS[0]
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await apiService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiService.createCategory(newCategory);
            setIsModalOpen(false);
            setNewCategory({ name: '', color: PRESET_COLORS[0], icon: PRESET_ICONS[0] });
            loadCategories();
        } catch (error) {
            console.error('Error creating category:', error);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            await apiService.deleteCategory(deleteConfirm.id);
            setDeleteConfirm({ open: false, id: null });
            loadCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    if (loading) {
        return <div className="loading">Cargando categorías...</div>;
    }

    return (
        <div className="categories-container">
            <div className="categories-header">
                <h1><FolderKanban size={32} className="inline mr-2" />Categorías</h1>
                <button className="btn-add-category" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Nueva Categoría
                </button>
            </div>

            <div className="categories-grid">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="category-card clickable"
                        style={{ borderColor: `${category.color}40`, cursor: 'pointer' }}
                        onClick={() => window.location.href = `/tasks/new?categoryId=${category.id}`}
                    >
                        <div className="category-actions" onClick={(e) => e.stopPropagation()}>
                            <button
                                className="btn-delete-category"
                                onClick={() => setDeleteConfirm({ open: true, id: category.id })}
                                title="Eliminar"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div
                            className="category-icon-wrapper"
                            style={{ backgroundColor: `${category.color}20`, color: category.color }}
                        >
                            {renderCategoryIcon(category.icon, 24)}
                        </div>
                        <div className="category-info">
                            <h3>{category.name}</h3>
                            <div className="category-stats">
                                {/* Future: Add task count here */}
                                0 tareas
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Nueva Categoría</h2>
                            <button className="btn-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newCategory.name}
                                    onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                    placeholder="Ej: Trabajo, Personal..."
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label>Color</label>
                                <div className="color-picker-grid">
                                    {PRESET_COLORS.map(color => (
                                        <div
                                            key={color}
                                            className={`color-option ${newCategory.color === color ? 'selected' : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setNewCategory({ ...newCategory, color })}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Icono</label>
                                <div className="emoji-grid">
                                    {PRESET_ICONS.map(icon => (
                                        <div
                                            key={icon}
                                            className={`emoji-option ${newCategory.icon === icon ? 'selected' : ''}`}
                                            onClick={() => setNewCategory({ ...newCategory, icon })}
                                        >
                                            {renderCategoryIcon(icon, 20)}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-submit">
                                    Crear Categoría
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteConfirm.open}
                title="Eliminar Categoría"
                message="¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirm({ open: false, id: null })}
                confirmText="Eliminar"
                danger
            />
        </div>
    );
}
