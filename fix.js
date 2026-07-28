const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'i18n', 'i18n.ts');
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// We know the line numbers approximately, but let's do exact line replacements based on indices.
// JS arrays are 0-indexed.
// Lines 1298 to 1388 are indices 1297 to 1387.
// We will replace them with empty strings.
for (let i = 1297; i <= 1387; i++) {
    lines[i] = '';
}

// Lines 2747 to 2808 are indices 2746 to 2807.
for (let i = 2746; i <= 2807; i++) {
    lines[i] = '';
}

// Now we need to insert the categories block at line 820 (index 819) and line 2329 (index 2328).
const esCategories = `        categories: {
          manageTitle: 'Gestionar Categorías',
          list: 'Lista de Categorías',
          namePlaceholder: 'Nombre de la categoría...',
          empty: 'No se encontraron categorías.',
          deleteConfirm: '¿Estás seguro de que deseas eliminar esta categoría?',
          createSuccess: 'Categoría creada con éxito',
          createError: 'Error al crear la categoría',
          updateSuccess: 'Categoría actualizada con éxito',
          updateError: 'Error al actualizar la categoría',
          deleteSuccess: 'Categoría eliminada con éxito',
          deleteError: 'Error al eliminar la categoría'
        },`;

const enCategories = `        categories: {
          manageTitle: 'Manage Categories',
          list: 'Categories List',
          namePlaceholder: 'Category name...',
          empty: 'No categories found.',
          deleteConfirm: 'Are you sure you want to delete this category?',
          createSuccess: 'Category created successfully',
          createError: 'Error creating category',
          updateSuccess: 'Category updated successfully',
          updateError: 'Error updating category',
          deleteSuccess: 'Category deleted successfully',
          deleteError: 'Error deleting category'
        },`;

// Insert esCategories at index 819 (after `technologies: {`)
lines[819] = lines[819] + '\n' + esCategories;

// Insert enCategories at index 2328 (after `technologies: {`)
lines[2328] = lines[2328] + '\n' + enCategories;

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Fixed i18n.ts');
