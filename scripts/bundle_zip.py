import os
import zipfile
import shutil

def bundle_all():
    base_dir = os.getcwd()
    public_dir = os.path.join(base_dir, 'public')
    os.makedirs(public_dir, exist_ok=True)

    # 1. Sync latest Code.gs and Index.html to public
    if os.path.exists('Code.gs'):
        shutil.copy('Code.gs', os.path.join(public_dir, 'Code.gs'))
    if os.path.exists('Index.html'):
        shutil.copy('Index.html', os.path.join(public_dir, 'Index.html'))
        shutil.copy('Index.html', os.path.join(public_dir, 'index-single.html'))
        shutil.copy('Index.html', os.path.join(public_dir, 'index_standalone.html'))
    if os.path.exists('AITeacherPlatform.html'):
        shutil.copy('AITeacherPlatform.html', os.path.join(public_dir, 'AITeacherPlatform.html'))

    # 2. Build Apps Script ZIP
    apps_script_zip_path = os.path.join(public_dir, 'apps_script_anh_sao_khue.zip')
    with zipfile.ZipFile(apps_script_zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
        if os.path.exists('Code.gs'):
            z.write('Code.gs', 'Code.gs')
        if os.path.exists('Index.html'):
            z.write('Index.html', 'Index.html')
        if os.path.exists('AITeacherPlatform.html'):
            z.write('AITeacherPlatform.html', 'AITeacherPlatform.html')
        if os.path.exists('README.md'):
            z.write('README.md', 'README.md')
        if os.path.exists('README_HUONG_DAN_SU_DUNG.md'):
            z.write('README_HUONG_DAN_SU_DUNG.md', 'README_HUONG_DAN_SU_DUNG.md')
    print("Created:", apps_script_zip_path)

    # 3. Build Full Project Source ZIP (clean, ignoring internal dirs and zips)
    ignored_dirs = {'node_modules', '.git', 'dist', '.cache', '.upm', '.local', '.aistudio', '.vite', '.vscode'}
    
    def add_directory_to_zip(zip_obj, folder_path, exclude_zips=True):
        for root, dirs, files in os.walk(folder_path):
            dirs[:] = [d for d in dirs if d not in ignored_dirs and not d.startswith('.')]
            for f in files:
                if exclude_zips and (f.endswith('.zip') or f.endswith('.tar.gz') or f.endswith('.log')):
                    continue
                full_p = os.path.join(root, f)
                rel_p = os.path.relpath(full_p, folder_path)
                zip_obj.write(full_p, rel_p)

    # Main source zip
    main_zip_path = os.path.join(public_dir, 'anh-sao-khue-source-code.zip')
    with zipfile.ZipFile(main_zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        add_directory_to_zip(zf, base_dir, exclude_zips=True)
    print("Created:", main_zip_path)

    # Duplicate to standard names
    shutil.copy(main_zip_path, os.path.join(public_dir, 'project-source.zip'))
    shutil.copy(main_zip_path, os.path.join(public_dir, 'AI_Teacher_Management_PRO_FINAL_SOURCE.zip'))
    shutil.copy(main_zip_path, os.path.join(public_dir, 'ai_lesson_plans_anh_sao_khue.zip'))
    shutil.copy(apps_script_zip_path, os.path.join(base_dir, 'apps_script_anh_sao_khue.zip'))
    shutil.copy(main_zip_path, os.path.join(base_dir, 'anh-sao-khue-source-code.zip'))
    shutil.copy(main_zip_path, os.path.join(base_dir, 'project-source.zip'))

    print("All ZIP packages updated successfully!")

if __name__ == '__main__':
    bundle_all()
