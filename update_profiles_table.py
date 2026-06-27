import re

with open('src/components/tables/ProfilesTable.tsx', 'r') as f:
    content = f.read()

# Chunk 1
content = content.replace(
    "import { SearchIcon } from 'lucide-react';",
    """import { SearchIcon, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { softDeleteProfile } from '@/app/admin/profiles/actions';"""
)

# Chunk 2
old_state = """  const [searchTerm, setSearchTerm] = useState(initialSearch);"""
new_state = """  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [deleteModalProfile, setDeleteModalProfile] = useState<Profile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleDropdown = (id: string) => {
    if (openDropdownId === id) setOpenDropdownId(null);
    else setOpenDropdownId(id);
  };

  const handleDelete = async () => {
    if (!deleteModalProfile) return;
    setIsDeleting(true);
    const result = await softDeleteProfile(deleteModalProfile.id);
    setIsDeleting(false);
    if (result.success) {
      setDeleteModalProfile(null);
    } else {
      alert('Gagal menghapus pengurus: ' + result.error);
    }
  };"""
content = content.replace(old_state, new_state)

# Chunk 3
old_header = """                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Peran (Role)
                  </TableCell>
                </TableRow>"""
new_header = """                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Peran (Role)
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    Aksi
                  </TableCell>
                </TableRow>"""
content = content.replace(old_header, new_header)

# Chunk 4
old_row = """                        <Badge
                          size="sm"
                          color={getRoleBadgeColor(profile.role)}
                        >
                          {profile.role || 'Member'}
                        </Badge>
                      </TableCell>
                    </TableRow>"""
new_row = """                        <Badge
                          size="sm"
                          color={getRoleBadgeColor(profile.role)}
                        >
                          {profile.role || 'Member'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center text-theme-sm dark:text-gray-400">
                        <div className="relative inline-block text-left">
                          <button
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dropdown-toggle"
                            onClick={() => toggleDropdown(profile.id)}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          <Dropdown
                            isOpen={openDropdownId === profile.id}
                            onClose={() => setOpenDropdownId(null)}
                            className="w-40 right-0 left-auto top-full mt-1"
                          >
                            <DropdownItem
                              tag="a"
                              href={`/admin/profiles/${profile.id}/edit`}
                              onItemClick={() => setOpenDropdownId(null)}
                              className="flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" /> Edit
                            </DropdownItem>
                            <DropdownItem
                              tag="button"
                              onClick={() => {
                                setDeleteModalProfile(profile);
                                setOpenDropdownId(null);
                              }}
                              className="flex items-center gap-2 text-error-500 hover:text-error-600 hover:bg-error-50"
                            >
                              <Trash2 className="w-4 h-4" /> Hapus
                            </DropdownItem>
                          </Dropdown>
                        </div>
                      </TableCell>
                    </TableRow>"""
content = content.replace(old_row, new_row)

# Chunk 5
old_footer = """          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>"""
new_footer = """          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteModalProfile} onClose={() => setDeleteModalProfile(null)}>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Konfirmasi Hapus</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Apakah Anda yakin ingin menghapus pengurus <span className="font-semibold text-gray-800 dark:text-white">{deleteModalProfile?.full_name}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteModalProfile(null)}>
              Batal
            </Button>
            <Button variant="primary" className="bg-error-500 hover:bg-error-600 border-error-500" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>"""
content = content.replace(old_footer, new_footer)

with open('src/components/tables/ProfilesTable.tsx', 'w') as f:
    f.write(content)

print("Updated ProfilesTable.tsx")
