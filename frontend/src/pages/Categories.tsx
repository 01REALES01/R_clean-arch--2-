import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Category, CreateCategoryDto } from '../types';
import './Categories.css';

const PRESET_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef',
    '#f43f5e', '#64748b'
];

const PRESET_ICONS = [
    '💼', '🏠', '🎓', '💪', '🛒', '✈️',
    '🎮', '🎵', '📚', '💡', '⭐', '🔥',
    '💻', '🎨', '💰', '🏥', '🍽️', '🚗'
];

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
            try {
                await apiService.deleteCategory(id);
                loadCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    if (loading) {
        return <div className="loading">Cargando categorías...</div>;
    }

    return (
        <div className="categories-container">
            <div className="categories-header">
                <h1>Categorías</h1>
                <button className="btn-add-category" onClick={() => setIsModalOpen(true)}>
                    <span>+</span> Nueva Categoría
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
                                onClick={() => handleDelete(category.id)}
                                title="Eliminar"
                            >
                                🗑️
                            </button>
                        </div>
                        <div
                            className="category-icon-wrapper"
                            style={{ backgroundColor: `${category.color}20`, color: category.color }}
                        >
                            {category.icon}
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
                            <button className="btn-close" onClick={() => setIsModalOpen(false)}>×</button>
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
                                            {icon}
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
        </div>
    );
}
