import os
import sys
import requests

PR_NUMBER = os.getenv('PR_NUMBER')
REPO = os.getenv('GITHUB_REPOSITORY')
GH_TOKEN = os.getenv('GITHUB_TOKEN')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if not all([PR_NUMBER, REPO, GH_TOKEN, GEMINI_API_KEY]):
    print("Erro: Faltam variáveis de ambiente.")
    sys.exit(1)

headers_json = {"Authorization": f"token {GH_TOKEN}", "Accept": "application/vnd.github.v3+json"}
headers_diff = {"Authorization": f"token {GH_TOKEN}", "Accept": "application/vnd.github.v3.diff"}

files_url = f"https://api.github.com/repos/{REPO}/pulls/{PR_NUMBER}/files"
files_resp = requests.get(files_url, headers=headers_json)

if files_resp.status_code != 200:
    print("Erro ao buscar lista de arquivos.")
    sys.exit(1)

arquivos_completos = ""
extensoes_permitidas = ('.cs', '.ts', '.tsx', '.py', '.js') # Filtre para ignorar imagens e binários

for file in files_resp.json():
    filename = file['filename']
    status = file['status']
    
    if status == 'removed' or not filename.endswith(extensoes_permitidas):
        continue
        
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            content = f.read()
            arquivos_completos += f"\n--- Arquivo Completo: {filename} ---\n```\n{content}\n```\n"

diff_resp = requests.get(f"https://api.github.com/repos/{REPO}/pulls/{PR_NUMBER}", headers=headers_diff)
diff_content = diff_resp.text

rules_content = open("rules.md", "r", encoding="utf-8").read() if os.path.exists("CLAUDE.md") else "Nenhuma regra específica."

system_prompt = f"""Você é um arquiteto de software revisando código .NET C# e React/React Native.
Regras do Repositório:
{rules_content}

Seu foco deve ser avaliar as MUDANÇAS do Diff. Use os arquivos completos apenas como contexto para entender a arquitetura (variáveis de classe, injeções de dependência, métodos existentes). Não sugira refatorações em partes do código que não foram alteradas no Diff, a menos que a alteração introduza um bug no código antigo."""

user_prompt = f"""Aqui está o Diff exato do que foi alterado neste Pull Request:
```diff
{diff_content}
```

Para garantir que você não tenha alucinações por falta de contexto, aqui está o código fonte integral dos arquivos modificados no seu estado final:
{arquivos_completos}

Por favor, revise as alterações do Diff com base nas regras de arquitetura."""

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={GEMINI_API_KEY}"

payload = {
    "system_instruction": {"parts": [{"text": system_prompt}]},
    "contents": [{"parts": [{"text": user_prompt}]}],
    "generationConfig": {
        "temperature": 0.2
    }
}

print("Enviando contexto completo (Diff + Arquivos) para o Gemini...")
gemini_resp = requests.post(url, json=payload)

if gemini_resp.status_code == 200:
    review_text = gemini_resp.json()['candidates'][0]['content']['parts'][0]['text']
    
    with open("review_output.txt", "w", encoding="utf-8") as f:
        f.write(review_text)
        
    print("Revisão salva com sucesso em review_output.txt.")
else:
    print(f"Erro na requisição da API do Gemini. Status Code: {gemini_resp.status_code}")
    print(f"Detalhes: {gemini_resp.text}")
    sys.exit(1)