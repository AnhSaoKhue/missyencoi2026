import os
import zipfile

def create_zip(output_filename, source_dir):
    ignored_dirs = {'node_modules', '.git', 'dist', '.cache', '.upm'}
    ignored_files = {output_filename, 'apps_script_anh_sao_khue.zip', 'project-source.zip'}

    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # Exclude ignored directories
            dirs[:] = [d for d in dirs if d not in ignored_dirs]
            for file in files:
                if file in ignored_files or file.endswith('.zip'):
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, source_dir)
                zipf.write(file_path, arcname)

if __name__ == '__main__':
    # 1. Create Apps Script minimal zip
    with zipfile.ZipFile('apps_script_anh_sao_khue.zip', 'w', zipfile.ZIP_DEFLATED) as z:
        z.write('Code.gs', 'Code.gs')
        z.write('Index.html', 'Index.html')
    print("Tao xong apps_script_anh_sao_khue.zip")

    # 2. Create full project source zip
    create_zip('project-source.zip', '.')
    print("Tao xong project-source.zip")
