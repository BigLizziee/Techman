const express = require('express');
const { executeQuery, executeInsert } = require('../config/database');
const { requireAuth, requireAdmin } = require('./auth');

const router = express.Router();


router.get('/', requireAuth, async (req, res) => {
    try {
        const query = `
            SELECT id, nome, descricao, url_imagem, status_ativo, data_inclusao
            FROM equipamentos 
            ORDER BY data_inclusao DESC
        `;
        
        const equipamentos = await executeQuery(query);
        
        res.json(equipamentos);

    } catch (error) {
        console.error('Erro ao buscar equipamentos:', error);
        res.status(500).json({ 
            error: 'Erro ao buscar equipamentos' 
        });
    }
});


router.get('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT id, nome, descricao, url_imagem, status_ativo, data_inclusao
            FROM equipamentos 
            WHERE id = ?
        `;
        
        const equipamentos = await executeQuery(query, [id]);
        
        if (equipamentos.length === 0) {
            return res.status(404).json({ 
                error: 'Equipamento não encontrado' 
            });
        }
        
        res.json(equipamentos[0]);

    } catch (error) {
        console.error('Erro ao buscar equipamento:', error);
        res.status(500).json({ 
            error: 'Erro ao buscar equipamento' 
        });
    }
});


router.post('/', requireAdmin, async (req, res) => {
    try {
        const { nome, descricao, url_imagem, status_ativo = true } = req.body;

        
        if (!nome || !descricao || !url_imagem) {
            return res.status(400).json({ 
                error: 'Nome, descrição e URL da imagem são obrigatórios' 
            });
        }

        const query = `
            INSERT INTO equipamentos (nome, descricao, url_imagem, status_ativo, data_inclusao) 
            VALUES (?, ?, ?, ?, CURDATE())
        `;
        
        const equipamentoId = await executeInsert(query, [
            nome, 
            descricao, 
            url_imagem, 
            status_ativo
        ]);

        res.status(201).json({
            success: true,
            id: equipamentoId,
            message: 'Equipamento cadastrado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao cadastrar equipamento:', error);
        res.status(500).json({ 
            error: 'Erro ao cadastrar equipamento' 
        });
    }
});


router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, url_imagem, status_ativo } = req.body;

        
        const checkQuery = 'SELECT id FROM equipamentos WHERE id = ?';
        const existing = await executeQuery(checkQuery, [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({ 
                error: 'Equipamento não encontrado' 
            });
        }

        const query = `
            UPDATE equipamentos 
            SET nome = ?, descricao = ?, url_imagem = ?, status_ativo = ?
            WHERE id = ?
        `;
        
        await executeQuery(query, [nome, descricao, url_imagem, status_ativo, id]);

        res.json({
            success: true,
            message: 'Equipamento atualizado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao atualizar equipamento:', error);
        res.status(500).json({ 
            error: 'Erro ao atualizar equipamento' 
        });
    }
});


router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

     
        const checkQuery = 'SELECT id FROM equipamentos WHERE id = ?';
        const existing = await executeQuery(checkQuery, [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({ 
                error: 'Equipamento não encontrado' 
            });
        }

       
        await executeQuery('DELETE FROM comentarios WHERE equipamento_id = ?', [id]);
        
        
        await executeQuery('DELETE FROM equipamentos WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Equipamento excluído com sucesso'
        });

    } catch (error) {
        console.error('Erro ao excluir equipamento:', error);
        res.status(500).json({ 
            error: 'Erro ao excluir equipamento' 
        });
    }
});

module.exports = router;

