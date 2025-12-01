#!/bin/bash

# Script para gerar relatório diário automaticamente

DATE=$(date +%Y-%m-%d)
YEAR=$(date +%Y)
MONTH=$(date +%m)

# Criar diretório se não existir
mkdir -p "docs/reports/daily/$YEAR/$MONTH"

# Nome do arquivo
FILENAME="docs/reports/daily/$YEAR/$MONTH/daily-report-$DATE.md"

# Verificar se arquivo já existe
if [ -f "$FILENAME" ]; then
    echo "⚠️  Relatório para $DATE já existe!"
    echo "📁 Localização: $FILENAME"
    exit 1
fi

# Copiar template
cp "docs/reports/templates/daily-report.md" "$FILENAME"

# Substituir data no arquivo
sed -i "s/\[DATA\]/$DATE/g" "$FILENAME"

echo "✅ Relatório diário criado!"
echo "📁 Localização: $FILENAME"
echo "📝 Edite o arquivo para adicionar suas informações"