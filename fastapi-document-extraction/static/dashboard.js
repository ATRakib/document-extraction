const API_BASE = '';
let extractedProducts = [];
let currentEditProduct = null;
let allSuppliers = [];
let currentFileHash = '';
let currentFileName = '';
let isDuplicateFile = false;

function getToken() {
    return localStorage.getItem('access_token');
}

function getHeaders() {
    return {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
    };
}

async function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
            return;
        }

        const user = await response.json();
        document.getElementById('userName').textContent = user.Username;
    } catch (error) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE}/api/auth/logout`, {
            method: 'POST',
            headers: getHeaders()
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    localStorage.removeItem('access_token');
    window.location.href = '/login';
}

async function loadAllSuppliers() {
    try {
        const response = await fetch(`${API_BASE}/api/products/suppliers`, {
            headers: getHeaders()
        });

        if (response.ok) {
            allSuppliers = await response.json();
        }
    } catch (error) {
        console.error('Failed to load suppliers:', error);
    }
}

function showTab(tab) {
    document.getElementById('uploadSection').classList.add('hidden');
    document.getElementById('productsSection').classList.add('hidden');
    document.getElementById('suppliersSection').classList.add('hidden');

    document.getElementById('uploadTab').classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
    document.getElementById('uploadTab').classList.add('text-gray-500');
    document.getElementById('productsTab').classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
    document.getElementById('productsTab').classList.add('text-gray-500');
    document.getElementById('suppliersTab').classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
    document.getElementById('suppliersTab').classList.add('text-gray-500');

    if (tab === 'upload') {
        document.getElementById('uploadSection').classList.remove('hidden');
        document.getElementById('uploadTab').classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
        document.getElementById('uploadTab').classList.remove('text-gray-500');
        loadAllSuppliers();
    } else if (tab === 'products') {
        document.getElementById('productsSection').classList.remove('hidden');
        document.getElementById('productsTab').classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
        document.getElementById('productsTab').classList.remove('text-gray-500');
        loadProducts();
    } else if (tab === 'suppliers') {
        document.getElementById('suppliersSection').classList.remove('hidden');
        document.getElementById('suppliersTab').classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
        document.getElementById('suppliersTab').classList.remove('text-gray-500');
        loadSuppliers();
    }
}

async function extractDocument() {
    const fileInput = document.getElementById('fileInput');
    const keywords = document.getElementById('keywords').value;

    if (!fileInput.files[0]) {
        alert('Please select a file');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('keywords', keywords);

    try {
        const response = await fetch(`${API_BASE}/api/upload/extract/preview`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });

        if (!response.ok) throw new Error('Extraction failed');

        const data = await response.json();
        extractedProducts = data.product_data_list;
        currentFileHash = data.file_hash;
        currentFileName = data.file_name;
        isDuplicateFile = data.is_duplicate;

        if (isDuplicateFile) {
            document.getElementById('duplicateWarning').classList.remove('hidden');
            document.getElementById('saveAllBtn').disabled = true;
            document.getElementById('saveAllBtn').classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            document.getElementById('duplicateWarning').classList.add('hidden');
            document.getElementById('saveAllBtn').disabled = false;
            document.getElementById('saveAllBtn').classList.remove('opacity-50', 'cursor-not-allowed');
        }

        displayExtractedProducts();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function findSupplierIdByName(supplierName) {
    if (!supplierName) return null;
    const supplier = allSuppliers.find(s => 
        s.Name.toLowerCase() === supplierName.toLowerCase()
    );
    return supplier ? supplier.Id : null;
}

function displayExtractedProducts() {
    const container = document.getElementById('productsList');
    container.innerHTML = '';

    extractedProducts.forEach((product, index) => {
        const supplierId = findSupplierIdByName(product.master.SupplierName);
        
        const card = document.createElement('div');
        card.className = 'border-2 border-blue-200 rounded-lg p-6 bg-gradient-to-r from-blue-50 to-white';
        
        const specsPreview = product.specifications.slice(0, 2).map(s => 
            `<div class="text-sm"><span class="font-medium">${s.SpecificationName || 'N/A'}:</span> ${s.Size || 'N/A'} - $${s.ProductSpecificationPrice || 0}</div>`
        ).join('');
        
        card.innerHTML = `
            <div class="mb-4 pb-4 border-b-2 border-blue-300">
                <h4 class="font-bold text-xl text-blue-900 mb-2">📦 Product Master</h4>
                <div class="grid grid-cols-2 gap-3 text-sm bg-white p-3 rounded">
                    <div><span class="font-medium text-blue-700">Model:</span> ${product.master.ModelName || 'N/A'}</div>
                    <div><span class="font-medium text-blue-700">Price:</span> $${product.master.ProductPrice || 0}</div>
                    <div><span class="font-medium text-blue-700">Country:</span> ${product.master.CountryOfOrigin || 'N/A'}</div>
                    <div><span class="font-medium text-blue-700">Supplier:</span> ${product.master.SupplierName || 'N/A'} ${supplierId ? '✓' : '❌'}</div>
                </div>
                <p class="text-sm text-gray-600 mt-2 bg-white p-2 rounded"><span class="font-medium">Description:</span> ${product.master.Description || 'No description'}</p>
            </div>
            <div class="mb-4">
                <h5 class="font-bold text-lg text-green-900 mb-2">📋 Specifications (${product.specifications.length})</h5>
                <div class="bg-green-50 p-3 rounded space-y-1">
                    ${specsPreview}
                    ${product.specifications.length > 2 ? '<div class="text-sm text-gray-500">... and ' + (product.specifications.length - 2) + ' more</div>' : ''}
                </div>
            </div>
            <button onclick="editExtractedProduct(${index})" class="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition shadow-md">
                ✏️ Edit Product & Specifications
            </button>
        `;
        container.appendChild(card);
    });

    document.getElementById('extractedData').classList.remove('hidden');
}

function editExtractedProduct(index) {
    const product = extractedProducts[index];
    currentEditProduct = index;

    const supplierId = findSupplierIdByName(product.master.SupplierName);
    
    const supplierOptions = allSuppliers.map(s => 
        `<option value="${s.Id}" ${s.Id === supplierId ? 'selected' : ''}>${s.Name}</option>`
    ).join('');

    const specsHtml = product.specifications.map((spec, i) => `
        <div class="border-2 border-green-200 rounded-lg p-4 mb-3 bg-green-50">
            <h6 class="font-bold text-green-900 mb-2">Specification #${i + 1}</h6>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" value="${spec.SpecificationName || ''}" placeholder="Specification Name" 
                        id="spec_name_${i}"class="w-full px-3 py-2 border border-gray-300 rounded">
</div>
<div>
<label class="block text-xs font-medium text-gray-700 mb-1">Size</label>
<input type="text" value="${spec.Size || ''}" placeholder="Size"
                     id="spec_size_${i}" class="w-full px-3 py-2 border border-gray-300 rounded">
</div>
<div class="col-span-2">
<label class="block text-xs font-medium text-gray-700 mb-1">Price</label>
<input type="number" step="0.01" value="${spec.ProductSpecificationPrice || 0}" placeholder="Price"
                     id="spec_price_${i}" class="w-full px-3 py-2 border border-gray-300 rounded">
</div>
<div class="col-span-2">
<label class="block text-xs font-medium text-gray-700 mb-1">Other Terms</label>
<textarea placeholder="Other Terms" id="spec_terms_${i}" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded">${spec.OtherTerms || ''}</textarea>
</div>
</div>
</div>
`).join('');
document.getElementById('editForm').innerHTML = `
    <div class="grid grid-cols-2 gap-6">
        <div class="col-span-2">
            <div class="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                <h4 class="font-bold text-xl text-blue-900 mb-4">📦 Product Master</h4>
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Model Name *</label>
                        <input type="text" id="edit_model" value="${product.master.ModelName || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea id="edit_description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg">${product.master.Description || ''}</textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Country of Origin</label>
                            <input type="text" id="edit_country" value="${product.master.CountryOfOrigin || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                            <select id="edit_supplier_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="">-- Select Supplier --</option>
                                ${supplierOptions}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Product Price</label>
                            <input type="number" step="0.01" id="edit_price" value="${product.master.ProductPrice || 0}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Quotation</label>
                            <input type="text" id="edit_quotation" value="${product.master.Quotation || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-2">
            <div class="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <h4 class="font-bold text-xl text-green-900 mb-4">📋 Product Specifications</h4>
                <div class="space-y-3">
                    ${specsHtml}
                </div>
            </div>
        </div>
        <div class="col-span-2">
            <button onclick="saveEditedProduct()" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                💾 Save All Changes
            </button>
        </div>
    </div>
`;

document.getElementById('editModal').classList.remove('hidden');
}
function saveEditedProduct() {
const product = extractedProducts[currentEditProduct];
const supplierId = document.getElementById('edit_supplier_id').value;
const selectedSupplier = allSuppliers.find(s => s.Id == supplierId);

product.master.ModelName = document.getElementById('edit_model').value;
product.master.Description = document.getElementById('edit_description').value;
product.master.CountryOfOrigin = document.getElementById('edit_country').value;
product.master.SupplierName = selectedSupplier ? selectedSupplier.Name : '';
product.master.ProductPrice = parseFloat(document.getElementById('edit_price').value);
product.master.Quotation = document.getElementById('edit_quotation').value;

product.specifications = product.specifications.map((spec, i) => ({
    SpecificationName: document.getElementById(`spec_name_${i}`).value,
    Size: document.getElementById(`spec_size_${i}`).value,
    ProductSpecificationPrice: parseFloat(document.getElementById(`spec_price_${i}`).value),
    OtherTerms: document.getElementById(`spec_terms_${i}`).value
}));

displayExtractedProducts();
closeEditModal();
}
function closeEditModal() {
document.getElementById('editModal').classList.add('hidden');
}
async function saveAllProducts() {
if (isDuplicateFile) {
alert('Cannot save duplicate file!');
return;
}
try {
    const response = await fetch(`${API_BASE}/api/upload/save/extracted`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            product_data_list: extractedProducts,
            file_hash: currentFileHash,
            file_name: currentFileName
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Save failed');
    }

    alert(data.message);
    extractedProducts = [];
    document.getElementById('extractedData').classList.add('hidden');
    document.getElementById('fileInput').value = '';
    document.getElementById('duplicateWarning').classList.add('hidden');
} catch (error) {
    alert('Error: ' + error.message);
}
}
async function loadProducts() {
try {
const response = await fetch(`${API_BASE}/api/products/`, { 
headers: getHeaders()
});
    if (!response.ok) throw new Error('Failed to load products');

    const products = await response.json();
    displayProducts(products);
} catch (error) {
    alert('Error: ' + error.message);
}
}
function displayProducts(products) {
const container = document.getElementById('productsTable');
if (products.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">No products found</p>';
    return;
}

container.innerHTML = `
    <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
            <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
            ${products.map(p => `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">${p.ModelName}</td>
                    <td class="px-6 py-4">${(p.Description || 'N/A').substring(0, 50)}...</td>
                    <td class="px-6 py-4 whitespace-nowrap">$${p.ProductPrice || 0}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${p.CountryOfOrigin || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button onclick="viewProduct(${p.Id})" class="text-blue-600 hover:text-blue-800 mr-3">View</button>
                        <button onclick="editProduct(${p.Id})" class="text-yellow-600 hover:text-yellow-800 mr-3">Edit</button>
                        <button onclick="deleteProduct(${p.Id})" class="text-red-600 hover:text-red-800">Delete</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    </table>
`;
}
async function viewProduct(id) {
try {
const response = await fetch(`${API_BASE}/api/products/${id}`, {
headers: getHeaders()
});
    if (!response.ok) throw new Error('Failed to load product');

    const data = await response.json();
    
    const specsHtml = data.specifications.map((spec, i) => `
        <div class="border-2 border-green-200 rounded-lg p-3 mb-2 bg-green-50">
            <p class="font-bold text-green-900">Specification #${i + 1}</p>
            <p><span class="font-medium">Name:</span> ${spec.SpecificationName || 'N/A'}</p>
            <p><span class="font-medium">Size:</span> ${spec.Size || 'N/A'}</p>
            <p><span class="font-medium">Price:</span> $${spec.ProductSpecificationPrice || 0}</p>
            <p><span class="font-medium">Terms:</span> ${spec.OtherTerms || 'N/A'}</p>
        </div>
    `).join('');

    document.getElementById('editForm').innerHTML = `
        <div class="space-y-4">
            <div class="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <h4 class="font-bold text-xl text-blue-900 mb-3">📦 Product Master</h4>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium mb-1">Model Name</label>
                        <p class="px-3 py-2 bg-white rounded">${data.product.ModelName}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Product Price</label>
                        <p class="px-3 py-2 bg-white rounded">$${data.product.ProductPrice || 0}</p>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium mb-1">Description</label>
                        <p class="px-3 py-2 bg-white rounded">${data.product.Description || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Country</label>
                        <p class="px-3 py-2 bg-white rounded">${data.product.CountryOfOrigin || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Quotation</label>
                        <p class="px-3 py-2 bg-white rounded">${data.product.Quotation || 'N/A'}</p>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium mb-1">File Name</label>
                        <p class="px-3 py-2 bg-white rounded">${data.product.FileName || 'N/A'}</p>
                    </div>
                </div>
            </div>
            <div class="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <h4 class="font-bold text-xl text-green-900 mb-3">📋 Specifications (${data.specifications.length})</h4>
                ${specsHtml}
            </div>
            <button onclick="closeEditModal()" class="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition">
                Close
            </button>
        </div>
    `;

    document.getElementById('editModal').classList.remove('hidden');
} catch (error) {
    alert('Error: ' + error.message);
}
}
async function editProduct(id) {
await loadAllSuppliers();
try {
    const response = await fetch(`${API_BASE}/api/products/${id}`, {
        headers: getHeaders()
    });

    if (!response.ok) throw new Error('Failed to load product');

    const data = await response.json();
    currentEditProduct = id;

    const supplierOptions = allSuppliers.map(s => 
        `<option value="${s.Id}" ${s.Id === data.product.SupplierId ? 'selected' : ''}>${s.Name}</option>`
    ).join('');

    const specsHtml = data.specifications.map((spec, i) => `
        <div class="border-2 border-green-200 rounded-lg p-4 mb-3 bg-green-50">
            <h6 class="font-bold text-green-900 mb-2">Specification #${i + 1}</h6>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" value="${spec.SpecificationName || ''}" placeholder="Specification Name" 
                        id="spec_name_${i}" class="w-full px-3 py-2 border border-gray-300 rounded">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Size</label>
                    <input type="text" value="${spec.Size || ''}" placeholder="Size"
                        id="spec_size_${i}" class="w-full px-3 py-2 border border-gray-300 rounded">
                </div>
                <div class="col-span-2">
                    <label class="block text-xs font-medium text-gray-700 mb-1">Price</label>
                    <input type="number" step="0.01" value="${spec.ProductSpecificationPrice || 0}" placeholder="Price"
                        id="spec_price_${i}" class="w-full px-3 py-2 border border-gray-300 rounded">
                </div>
                <div class="col-span-2">
                    <label class="block text-xs font-medium text-gray-700 mb-1">Other Terms</label>
                    <textarea placeholder="Other Terms" id="spec_terms_${i}" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded">${spec.OtherTerms || ''}</textarea>
                </div>
            </div>
        </div>
    `).join('');

    document.getElementById('editForm').innerHTML = `
        <div class="space-y-4">
            <div class="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <h4 class="font-bold text-xl text-blue-900 mb-4">📦 Product Master</h4>
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Model Name *</label>
                        <input type="text" id="edit_model" value="${data.product.ModelName || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea id="edit_description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg">${data.product.Description || ''}</textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Country of Origin</label>
                            <input type="text" id="edit_country" value="${data.product.CountryOfOrigin || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                            <select id="edit_supplier_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="">-- Select Supplier --</option>
                                ${supplierOptions}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Product Price</label>
                            <input type="number" step="0.01" id="edit_price" value="${data.product.ProductPrice || 0}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Quotation</label>
                            <input type="text" id="edit_quotation" value="${data.product.Quotation || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <h4 class="font-bold text-xl text-green-900 mb-4">📋 Product Specifications</h4>
                ${specsHtml}
            </div>
            <button onclick="saveProductEdit()" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                💾 Save All Changes
            </button>
        </div>
    `;

    document.getElementById('editModal').classList.remove('hidden');
} catch (error) {
    alert('Error: ' + error.message);
}
}
async function saveProductEdit() {
const masterData = {
ModelName: document.getElementById('edit_model').value,
Description: document.getElementById('edit_description').value,
CountryOfOrigin: document.getElementById('edit_country').value,
SupplierId: parseInt(document.getElementById('edit_supplier_id').value) || null,
ProductPrice: parseFloat(document.getElementById('edit_price').value) || 0,
Quotation: document.getElementById('edit_quotation').value,
FileName: null,
FileLocation: null
};
const specificationsData = [];
let i = 0;
while (document.getElementById(`spec_name_${i}`)) {
    specificationsData.push({
        SpecificationName: document.getElementById(`spec_name_${i}`).value,
        Size: document.getElementById(`spec_size_${i}`).value,
        ProductSpecificationPrice: parseFloat(document.getElementById(`spec_price_${i}`).value) || 0,
        OtherTerms: document.getElementById(`spec_terms_${i}`).value
    });
    i++;
}

const requestData = {
    master: masterData,
    specifications: specificationsData
};

try {
    const response = await fetch(`${API_BASE}/api/products/${currentEditProduct}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(requestData)
    });

    if (!response.ok) throw new Error('Update failed');

    alert('Product updated successfully!');
    closeEditModal();
    loadProducts();
} catch (error) {
    alert('Error: ' + error.message);
}
}
async function deleteProduct(id) {
if (!confirm('Are you sure you want to delete this product?')) return;
try {
    const response = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });

    if (!response.ok) throw new Error('Delete failed');

    alert('Product deleted successfully!');
    loadProducts();
} catch (error) {
    alert('Error: ' + error.message);
}
}
async function loadSuppliers() {
try {
const response = await fetch(`${API_BASE}/api/products/suppliers`, {
headers: getHeaders()
});
    if (!response.ok) throw new Error('Failed to load suppliers');

    const suppliers = await response.json();
    allSuppliers = suppliers;
    displaySuppliers(suppliers);
} catch (error) {
    alert('Error: ' + error.message);
}
}
function displaySuppliers(suppliers) {
const container = document.getElementById('suppliersTable');
if (suppliers.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">No suppliers found</p>';
    return;
}

container.innerHTML = `
    <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
            <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
            ${suppliers.map(s => `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">${s.Id}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${s.Name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${s.Country || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${s.Phone || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${s.Email || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button onclick="editSupplier(${s.Id})" class="text-yellow-600 hover:text-yellow-800 mr-3">Edit</button>
                        <button onclick="deleteSupplier(${s.Id})" class="text-red-600 hover:text-red-800">Delete</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    </table>
`;
}
function showAddSupplier() {
document.getElementById('supplierForm').reset();
document.getElementById('supplierForm').dataset.mode = 'create';
document.getElementById('supplierForm').dataset.id = '';
document.getElementById('supplierModal').classList.remove('hidden');
}
function closeSupplierModal() {
document.getElementById('supplierModal').classList.add('hidden');
document.getElementById('supplierForm').reset();
}
async function editSupplier(id) {
try {
const response = await fetch(`${API_BASE}/api/products/suppliers/${id}`, {
headers: getHeaders()
});
    if (!response.ok) throw new Error('Failed to load supplier');

    const supplier = await response.json();

    document.getElementById('supplierName').value = supplier.Name;
    document.getElementById('supplierAddress1').value = supplier.Address1 || '';
    document.getElementById('supplierAddress2').value = supplier.Address2 || '';
    document.getElementById('supplierCountry').value = supplier.Country || '';
    document.getElementById('supplierPhone').value = supplier.Phone || '';
    document.getElementById('supplierEmail').value = supplier.Email || '';
    document.getElementById('supplierFax').value = supplier.Fax || '';

    document.getElementById('supplierForm').dataset.mode = 'edit';
    document.getElementById('supplierForm').dataset.id = id;
    document.getElementById('supplierModal').classList.remove('hidden');
} catch (error) {
    alert('Error: ' + error.message);
}
}
document.getElementById('supplierForm').addEventListener('submit', async (e) => {
e.preventDefault();
const supplierData = {
    Name: document.getElementById('supplierName').value,
    Address1: document.getElementById('supplierAddress1').value,
    Address2: document.getElementById('supplierAddress2').value,
    Country: document.getElementById('supplierCountry').value,
    Phone: document.getElementById('supplierPhone').value,
    Email: document.getElementById('supplierEmail').value,
    Fax: document.getElementById('supplierFax').value
};

const mode = e.target.dataset.mode;
const id = e.target.dataset.id;

try {
    let response;
    if (mode === 'edit') {
        response = await fetch(`${API_BASE}/api/products/suppliers/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(supplierData)
        });
    } else {
        response = await fetch(`${API_BASE}/api/products/suppliers`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(supplierData)
        });
    }

    if (!response.ok) throw new Error('Failed to save supplier');

    alert(`Supplier ${mode === 'edit' ? 'updated' : 'created'} successfully!`);
    closeSupplierModal();
    loadSuppliers();
} catch (error) {
    alert('Error: ' + error.message);
}
});
async function deleteSupplier(id) {
if (!confirm('Are you sure you want to delete this supplier?')) return;
try {
    const response = await fetch(`${API_BASE}/api/products/suppliers/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });

    if (!response.ok) throw new Error('Delete failed');

    alert('Supplier deleted successfully!');
    loadSuppliers();
} catch (error) {
    alert('Error: ' + error.message);
}
}
checkAuth();
loadAllSuppliers();

// const API_BASE = '';
// let extractedProducts = [];
// let currentEditProduct = null;

// function getToken() {
//     return localStorage.getItem('access_token');
// }

// function getHeaders() {
//     return {
//         'Authorization': `Bearer ${getToken()}`,
//         'Content-Type': 'application/json'
//     };
// }

// async function checkAuth() {
//     const token = getToken();
//     if (!token) {
//         window.location.href = '/login';
//         return;
//     }

//     try {
//         const response = await fetch(`${API_BASE}/api/auth/me`, {
//             headers: getHeaders()
//         });

//         if (!response.ok) {
//             localStorage.removeItem('access_token');
//             window.location.href = '/login';
//             return;
//         }

//         const user = await response.json();
//         document.getElementById('userName').textContent = user.Username;
//     } catch (error) {
//         localStorage.removeItem('access_token');
//         window.location.href = '/login';
//     }
// }

// async function logout() {
//     try {
//         await fetch(`${API_BASE}/api/auth/logout`, {
//             method: 'POST',
//             headers: getHeaders()
//         });
//     } catch (error) {
//         console.error('Logout error:', error);
//     }
//     localStorage.removeItem('access_token');
//     window.location.href = '/login';
// }

// function showTab(tab) {
//     document.getElementById('uploadSection').classList.add('hidden');
//     document.getElementById('productsSection').classList.add('hidden');
//     document.getElementById('suppliersSection').classList.add('hidden');

//     document.getElementById('uploadTab').classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
//     document.getElementById('uploadTab').classList.add('text-gray-500');
//     document.getElementById('productsTab').classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
//     document.getElementById('productsTab').classList.add('text-gray-500');
//     document.getElementById('suppliersTab').classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
//     document.getElementById('suppliersTab').classList.add('text-gray-500');

//     if (tab === 'upload') {
//         document.getElementById('uploadSection').classList.remove('hidden');
//         document.getElementById('uploadTab').classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
//         document.getElementById('uploadTab').classList.remove('text-gray-500');
//     } else if (tab === 'products') {
//         document.getElementById('productsSection').classList.remove('hidden');
//         document.getElementById('productsTab').classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
//         document.getElementById('productsTab').classList.remove('text-gray-500');
//         loadProducts();
//     } else if (tab === 'suppliers') {
//         document.getElementById('suppliersSection').classList.remove('hidden');
//         document.getElementById('suppliersTab').classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
//         document.getElementById('suppliersTab').classList.remove('text-gray-500');
//         loadSuppliers();
//     }
// }

// async function extractDocument() {
//     const fileInput = document.getElementById('fileInput');
//     const keywords = document.getElementById('keywords').value;

//     if (!fileInput.files[0]) {
//         alert('Please select a file');
//         return;
//     }

//     const formData = new FormData();
//     formData.append('file', fileInput.files[0]);
//     formData.append('keywords', keywords);

//     try {
//         const response = await fetch(`${API_BASE}/api/upload/extract/preview`, {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${getToken()}`
//             },
//             body: formData
//         });

//         if (!response.ok) throw new Error('Extraction failed');

//         const data = await response.json();
//         extractedProducts = data.product_data_list;
//         displayExtractedProducts();
//     } catch (error) {
//         alert('Error: ' + error.message);
//     }
// }

// function displayExtractedProducts() {
//     const container = document.getElementById('productsList');
//     container.innerHTML = '';

//     extractedProducts.forEach((product, index) => {
//         const card = document.createElement('div');
//         card.className = 'border border-gray-200 rounded-lg p-4 bg-gray-50';
//         card.innerHTML = `
//             <h4 class="font-bold text-lg mb-2">${product.master.ModelName || 'N/A'}</h4>
//             <p class="text-sm text-gray-600 mb-2">${product.master.Description || 'No description'}</p>
//             <div class="grid grid-cols-2 gap-2 text-sm">
//                 <div><span class="font-medium">Price:</span> $${product.master.ProductPrice || 0}</div>
//                 <div><span class="font-medium">Country:</span> ${product.master.CountryOfOrigin || 'N/A'}</div>
//                 <div><span class="font-medium">Supplier:</span> ${product.master.SupplierName || 'N/A'}</div>
//                 <div><span class="font-medium">Specs:</span> ${product.specifications.length}</div>
//             </div>
//             <button onclick="editExtractedProduct(${index})" class="mt-3 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">
//                 Edit
//             </button>
//         `;
//         container.appendChild(card);
//     });

//     document.getElementById('extractedData').classList.remove('hidden');
// }

// function editExtractedProduct(index) {
//     const product = extractedProducts[index];
//     currentEditProduct = index;

//     const specsHtml = product.specifications.map((spec, i) => `
//         <div class="border border-gray-200 rounded p-3 mb-2">
//             <input type="text" value="${spec.SpecificationName || ''}" placeholder="Specification Name" 
//                 id="spec_name_${i}" class="w-full px-3 py-2 border border-gray-300 rounded mb-2">
//             <input type="text" value="${spec.Size || ''}" placeholder="Size"
//                 id="spec_size_${i}" class="w-full px-3 py-2 border border-gray-300 rounded mb-2">
//             <input type="number" value="${spec.ProductSpecificationPrice || 0}" placeholder="Price"
//                 id="spec_price_${i}" class="w-full px-3 py-2 border border-gray-300 rounded mb-2">
//             <textarea placeholder="Other Terms" id="spec_terms_${i}" class="w-full px-3 py-2 border border-gray-300 rounded">${spec.OtherTerms || ''}</textarea>
//         </div>
//     `).join('');

//     document.getElementById('editForm').innerHTML = `
//         <div class="space-y-4">
//             <div>
//                 <label class="block text-sm font-medium mb-2">Model Name</label>
//                 <input type="text" id="edit_model" value="${product.master.ModelName || ''}" class="w-full px-3 py-2 border border-gray-300 rounded">
//             </div>
//             <div>
//                 <label class="block text-sm font-medium mb-2">Description</label>
//                 <textarea id="edit_description" class="w-full px-3 py-2 border border-gray-300 rounded">${product.master.Description || ''}</textarea>
//             </div>
//             <div>
//                 <label class="block text-sm font-medium mb-2">Country of Origin</label>
//                 <input type="text" id="edit_country" value="${product.master.CountryOfOrigin || ''}" class="w-full px-3 py-2 border border-gray-300 rounded">
//             </div>
//             <div>
//                 <label class="block text-sm font-medium mb-2">Supplier Name</label>
//                 <input type="text" id="edit_supplier" value="${product.master.SupplierName || ''}" class="w-full px-3 py-2 border border-gray-300 rounded">
//             </div>
//             <div>
//                 <label class="block text-sm font-medium mb-2">Product Price</label>
//                 <input type="number" step="0.01" id="edit_price" value="${product.master.ProductPrice || 0}" class="w-full px-3 py-2 border border-gray-300 rounded">
//             </div>
//             <div>
//                 <label class="block text-sm font-medium mb-2">Quotation</label>
//                 <input type="text" id="edit_quotation" value="${product.master.Quotation || ''}" class="w-full px-3 py-2 border border-gray-300 rounded">
//             </div>
//             <div>
//                 <label class="block text-sm font-medium mb-2">Specifications</label>
//                 ${specsHtml}
//             </div>
//             <button onclick="saveEditedProduct()" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
//                 Save Changes
//             </button>
//         </div>
//     `;

//     document.getElementById('editModal').classList.remove('hidden');
// }

// function saveEditedProduct() {
//     const product = extractedProducts[currentEditProduct];

//     product.master.ModelName = document.getElementById('edit_model').value;
//     product.master.Description = document.getElementById('edit_description').value;
//     product.master.CountryOfOrigin = document.getElementById('edit_country').value;
//     product.master.SupplierName = document.getElementById('edit_supplier').value;
//     product.master.ProductPrice = parseFloat(document.getElementById('edit_price').value);
//     product.master.Quotation = document.getElementById('edit_quotation').value;

//     product.specifications = product.specifications.map((spec, i) => ({
//         SpecificationName: document.getElementById(`spec_name_${i}`).value,
//         Size: document.getElementById(`spec_size_${i}`).value,
//         ProductSpecificationPrice: parseFloat(document.getElementById(`spec_price_${i}`).value),
//         OtherTerms: document.getElementById(`spec_terms_${i}`).value
//     }));

//     displayExtractedProducts();
//     closeEditModal();
// }

// function closeEditModal() {
//     document.getElementById('editModal').classList.add('hidden');
// }

// async function saveAllProducts() {
//     try {
//         const response = await fetch(`${API_BASE}/api/upload/save/extracted`, {
//             method: 'POST',
//             headers: getHeaders(),
//             body: JSON.stringify(extractedProducts)
//         });

//         if (!response.ok) throw new Error('Save failed');

//         alert('All products saved successfully!');
//         extractedProducts = [];
//         document.getElementById('extractedData').classList.add('hidden');
//         document.getElementById('fileInput').value = '';
//     } catch (error) {
//         alert('Error: ' + error.message);
//     }
// }

// async function loadProducts() {
//     try {
//         const response = await fetch(`${API_BASE}/api/products/`, {
//             headers: getHeaders()
//         });

//         if (!response.ok) throw new Error('Failed to load products');

//         const products = await response.json();
//         displayProducts(products);
//     } catch (error) {
//         alert('Error: ' + error.message);
//     }
// }

// function displayProducts(products) {
//     const container = document.getElementById('productsTable');
    
//     if (products.length === 0) {
//         container.innerHTML = '<p class="text-gray-500 text-center py-8">No products found</p>';
//         return;
//     }

//     container.innerHTML = `
//         <table class="min-w-full divide-y divide-gray-200">
//             <thead class="bg-gray-50">
//                 <tr>
//                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
//                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
//                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
//                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
//                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//                 </tr>
//             </thead>
//             <tbody class="bg-white divide-y divide-gray-200">
//                 ${products.map(p => `
//                     <tr>
//                         <td class="px-6 py-4 whitespace-nowrap">${p.ModelName}</td>
//                         <td class="px-6 py-4">${p.Description || 'N/A'}</td>
//                         <td class="px-6 py-4 whitespace-nowrap">$${p.ProductPrice || 0}</td>
//                         <td class="px-6 py-4 whitespace-nowrap">${p.CountryOfOrigin || 'N/A'}</td>
//                         <td class="px-6 py-4 whitespace-nowrap">
//                             <button onclick="viewProduct(${p.Id})" class="text-blue-600 hover:text-blue-800 mr-3">View</button>
//                             <button onclick="editProduct(${p.Id})" class="text-yellow-600 hover:text-yellow-800 mr-3">Edit</button>
//                             <button onclick="deleteProduct(${p.Id})" class="text-red-600 hover:text-red-800">Delete</button>
//                         </td>
//                     </tr>
//                 `).join('')}
//             </tbody>
//         </table>
//     `;
// }

// async function viewProduct(id) {
//     try {
//         const response = await fetch(`${API_BASE}/api/products/${id}`, {
//             headers: getHeaders()
//         });

//         if (!response.ok) throw new Error('Failed to load product');

//         const data = await response.json();
        
//         const specsHtml = data.specifications.map(spec => `
//             <div class="border border-gray-200 rounded p-3 mb-2">
//                 <p><span class="font-medium">Name:</span> ${spec.SpecificationName || 'N/A'}</p>
//                 <p><span class="font-medium">Size:</span> ${spec.Size || 'N/A'}</p>
//                 <p><span class="font-medium">Price:</span> $${spec.ProductSpecificationPrice || 0}</p>
//                 <p><span class="font-medium">Terms:</span> ${spec.OtherTerms || 'N/A'}</p>
//             </div>
//         `).join('');

//         document.getElementById('editForm').innerHTML = `
//             <div class="space-y-4">
//                 <div>
//                     <label class="block text-sm font-medium mb-2">Model Name</label>
//                     <p class="px-3 py-2 bg-gray-50 rounded">${data.product.ModelName}</p>
//                 </div>
//                 <div>
//                     <label class="block text-sm font-medium mb-2">Description</label>
//                     <p class="px-3 py-2 bg-gray-50 rounded">${data.product.Description || 'N/A'}</p>
//                 </div>
//                 <div>
//                     <label class="block text-sm font-medium mb-2">Country of Origin</label>
//                     <p class="px-3 py-2 bg-gray-50 rounded">${data.product.CountryOfOrigin || 'N/A'}</p>
//                 </div>
//                 <div>
//                     <label class="block text-sm font-medium mb-2">Product Price</label>
//                     <p class="px-3 py-2 bg-gray-50 rounded">$${data.product.ProductPrice || 0}</p>
//                 </div>
//                 <div>
//                     <label class="block text-sm font-medium mb-2">Quotation</label>
//                     <p class="px-3 py-2 bg-gray-50 rounded">${data.product.Quotation || 'N/A'}</p>
//                 </div>
//                 <div>
//                     <label class="block text-sm font-medium mb-2">File Name</label>
//                     <p class="px-3 py-2 bg-gray-50 rounded">${data.product.FileName || 'N/A'}</p>
//                 </div>
//                 <div>
//                     <label class="block text-sm font-medium mb-2">Specifications</label>
//                     ${specsHtml}
//                 </div>
//                 <button onclick="closeEditModal()" class="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition">
//                     Close
//                 </button>
//             </div>
//         `;

//         document.getElementById('editModal').classList.remove('hidden');
//     } catch (error) {
//         alert('Error: ' + error.message);
//     }
// }

// async function editProduct(id) {
//     try {
//         const response = await fetch(`${API_BASE}/api/products/${id}`, {
//             headers: getHeaders()
//         });

//         if (!response.ok) throw new Error('Failed to load product');

//         const data = await response.json();
//         currentEditProduct = id;

//         const specsHtml = data.specifications.map((spec, i) => `
//             <div class="border border-gray-200 rounded p-3 mb-2">
//                 <input type="text" value="${spec.SpecificationName || ''}" placeholder="Specification Name" 
//                     id="spec_name_${i}" class="w-full px-3 py-2 border border-gray-300 rounded mb-2">
//                 <input type="text" value="${spec.Size || ''}" placeholder="Size"
//                     id="spec_size_${i}" class="w-full px-3 py-2 border border-gray-300 rounded mb-2">
//                 <input type="number" step="0.01" value="${spec.ProductSpecificationPrice || 0}" placeholder="Price"
//                     id="spec_price_${i}" class="w-full px-3 py-2 border border-gray-300 rounded mb-2">
//                 <textarea placeholder="Other Terms" id="spec_terms_${i}" class="w-full px-3 py-2 border border-gray-300 rounded">${spec.OtherTerms || ''}</textarea>
//             </div>
//         `).join('');

//         document.getElementById('editForm').innerHTML = `
//             <div class="space-y-4">
//                 <div>
//                     <label class="block text-sm font-medium mb-2">Model Name</label>
//                     <input type="text" id="edit_model" value="${data.product.ModelName || ''}" class="w-full px-3 py-2 border border-gray-300 rounded">
//                 </div>
//                 <div>
//                     <label class="block text-sm font-medium mb-2">Description</label>
//                     <textarea id="edit_description" class="w-full px-3 py-2 border border-gray-300 rounded">${data.product.Description || ''}</textarea>
//                 </div>
//                 <div>
//                     <label class="block text-sm font-medium mb-2">Country of Origin</label>
//                     <input type="text" id="edit_country" value="${data.product.CountryOfOrigin || ''}" class="w-full px-3 py-2 border border-gray-300 rounded">
//                 </div>
//                 <div>
//                     <label class="block text-sm font-medium mb-2">Supplier ID</label>
//                     <input type="number" id="edit_supplier_id" value="${data.product.SupplierId || ''}" class="w-full px-3 py-2 border border-gray-300 rounded">
//                 </div>
//                 <div>
//                     <label class="block text-sm font-medium mb-2">Product Price</label>
//                     <input type="number" step="0.01" id="edit_price" value="${data.product.ProductPrice || 0}" class="w-full px-3 py-2 border border-gray-300 rounded">
//                 </div>
//                 <div>
//                     <label class="block text-sm font-medium mb-2">Quotation</label>
//                     <input type="text" id="edit_quotation" value="${data.product.Quotation || ''}" class="w-full px-3 py-2 border border-gray-300 rounded">
//                 </div>
//                 <div>
//                     <label class="block text-sm font-medium mb-2">Specifications</label>
//                     ${specsHtml}
//                 </div>
//                 <button onclick="saveProductEdit()" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
//                     Save Changes
//                 </button>
//             </div>
//         `;

//         document.getElementById('editModal').classList.remove('hidden');
//     } catch (error) {
//         alert('Error: ' + error.message);
//     }
// }

// async function saveProductEdit() {
//     const masterData = {
//         ModelName: document.getElementById('edit_model').value,
//         Description: document.getElementById('edit_description').value,
//         CountryOfOrigin: document.getElementById('edit_country').value,
//         SupplierId: parseInt(document.getElementById('edit_supplier_id').value) || null,
//         ProductPrice: parseFloat(document.getElementById('edit_price').value) || 0,
//         Quotation: document.getElementById('edit_quotation').value,
//         FileName: null,
//         FileLocation: null
//     };

//     const specificationsData = [];
//     let i = 0;
//     while (document.getElementById(`spec_name_${i}`)) {
//         specificationsData.push({
//             SpecificationName: document.getElementById(`spec_name_${i}`).value,
//             Size: document.getElementById(`spec_size_${i}`).value,
//             ProductSpecificationPrice: parseFloat(document.getElementById(`spec_price_${i}`).value) || 0,
//             OtherTerms: document.getElementById(`spec_terms_${i}`).value
//         });
//         i++;
//     }

//     const requestData = {
//         master: masterData,
//         specifications: specificationsData
//     };

//     try {
//         const response = await fetch(`${API_BASE}/api/products/${currentEditProduct}`, {
//             method: 'PUT',
//             headers: getHeaders(),
//             body: JSON.stringify(requestData)
//         });

//         if (!response.ok) throw new Error('Update failed');

//         alert('Product updated successfully!');
//         closeEditModal();
//         loadProducts();
//     } catch (error) {
//         alert('Error: ' + error.message);
//     }
// }

// async function deleteProduct(id) {
//     if (!confirm('Are you sure you want to delete this product?')) return;

//     try {
//         const response = await fetch(`${API_BASE}/api/products/${id}`, {
//             method: 'DELETE',
//             headers: getHeaders()
//         });

//         if (!response.ok) throw new Error('Delete failed');

//         alert('Product deleted successfully!');
//         loadProducts();
//     } catch (error) {
//         alert('Error: ' + error.message);
//     }
// }

// async function loadSuppliers() {
//     try {
//         const response = await fetch(`${API_BASE}/api/products/suppliers`, {
//             headers: getHeaders()
//         });

//         if (!response.ok) throw new Error('Failed to load suppliers');

//         const suppliers = await response.json();
//         displaySuppliers(suppliers);
//     } catch (error) {
//         alert('Error: ' + error.message);
//     }
// }

// function displaySuppliers(suppliers) {
//     const container = document.getElementById('suppliersTable');
    
//     if (suppliers.length === 0) {
//         container.innerHTML = '<p class="text-gray-500 text-center py-8">No suppliers found</p>';
//         return;
//     }

//     container.innerHTML = `
//         <table class="min-w-full divide-y divide-gray-200">
//             <thead class="bg-gray-50">
//                 <tr>
//                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
//                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
//                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
//                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
//                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
//                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//                 </tr>
//             </thead>
//             <tbody class="bg-white divide-y divide-gray-200">
//                 ${suppliers.map(s => `
//                     <tr>
//                         <td class="px-6 py-4 whitespace-nowrap">${s.Id}</td>
//                         <td class="px-6 py-4 whitespace-nowrap">${s.Name}</td>
//                         <td class="px-6 py-4 whitespace-nowrap">${s.Country || 'N/A'}</td>
//                         <td class="px-6 py-4 whitespace-nowrap">${s.Phone || 'N/A'}</td>
//                         <td class="px-6 py-4 whitespace-nowrap">${s.Email || 'N/A'}</td>
//                         <td class="px-6 py-4 whitespace-nowrap">
//                             <button onclick="editSupplier(${s.Id})" class="text-yellow-600 hover:text-yellow-800 mr-3">Edit</button>
//                             <button onclick="deleteSupplier(${s.Id})" class="text-red-600 hover:text-red-800">Delete</button>
//                         </td>
//                     </tr>
//                 `).join('')}
//             </tbody>
//         </table>
//     `;
// }

// function showAddSupplier() {
//     document.getElementById('supplierForm').reset();
//     document.getElementById('supplierForm').dataset.mode = 'create';
//     document.getElementById('supplierForm').dataset.id = '';
//     document.getElementById('supplierModal').classList.remove('hidden');
// }

// function closeSupplierModal() {
//     document.getElementById('supplierModal').classList.add('hidden');
//     document.getElementById('supplierForm').reset();
// }

// async function editSupplier(id) {
//     try {
//         const response = await fetch(`${API_BASE}/api/products/suppliers/${id}`, {
//             headers: getHeaders()
//         });

//         if (!response.ok) throw new Error('Failed to load supplier');

//         const supplier = await response.json();

//         document.getElementById('supplierName').value = supplier.Name;
//         document.getElementById('supplierAddress1').value = supplier.Address1 || '';
//         document.getElementById('supplierAddress2').value = supplier.Address2 || '';
//         document.getElementById('supplierCountry').value = supplier.Country || '';
//         document.getElementById('supplierPhone').value = supplier.Phone || '';
//         document.getElementById('supplierEmail').value = supplier.Email || '';
//         document.getElementById('supplierFax').value = supplier.Fax || '';

//         document.getElementById('supplierForm').dataset.mode = 'edit';
//         document.getElementById('supplierForm').dataset.id = id;
//         document.getElementById('supplierModal').classList.remove('hidden');
//     } catch (error) {
//         alert('Error: ' + error.message);
//     }
// }

// document.getElementById('supplierForm').addEventListener('submit', async (e) => {
//     e.preventDefault();

//     const supplierData = {
//         Name: document.getElementById('supplierName').value,
//         Address1: document.getElementById('supplierAddress1').value,
//         Address2: document.getElementById('supplierAddress2').value,
//         Country: document.getElementById('supplierCountry').value,
//         Phone: document.getElementById('supplierPhone').value,
//         Email: document.getElementById('supplierEmail').value,
//         Fax: document.getElementById('supplierFax').value
//     };

//     const mode = e.target.dataset.mode;
//     const id = e.target.dataset.id;

//     try {
//         let response;
//         if (mode === 'edit') {
//             response = await fetch(`${API_BASE}/api/products/suppliers/${id}`, {
//                 method: 'PUT',
//                 headers: getHeaders(),
//                 body: JSON.stringify(supplierData)
//             });
//         } else {
//             response = await fetch(`${API_BASE}/api/products/suppliers`, {
//                 method: 'POST',
//                 headers: getHeaders(),
//                 body: JSON.stringify(supplierData)
//             });
//         }

//         if (!response.ok) throw new Error('Failed to save supplier');

//         alert(`Supplier ${mode === 'edit' ? 'updated' : 'created'} successfully!`);
//         closeSupplierModal();
//         loadSuppliers();
//     } catch (error) {
//         alert('Error: ' + error.message);
//     }
// });

// async function deleteSupplier(id) {
//     if (!confirm('Are you sure you want to delete this supplier?')) return;

//     try {
//         const response = await fetch(`${API_BASE}/api/products/suppliers/${id}`, {
//             method: 'DELETE',
//             headers: getHeaders()
//         });

//         if (!response.ok) throw new Error('Delete failed');

//         alert('Supplier deleted successfully!');
//         loadSuppliers();
//     } catch (error) {
//         alert('Error: ' + error.message);
//     }
// }

// checkAuth();