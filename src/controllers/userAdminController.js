import Joi from 'joi';
import { listUsers, updateUser, deleteUser, getUserById } from '../models/users.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { notFound } from '../core/apiError.js';

export async function list(req, res, next) { try { res.json({ users: await listUsers() }); } catch(e){ next(e);} }

const updateSchema = Joi.object({ name: Joi.string().min(2).optional(), phone: Joi.string().optional(), role: Joi.string().valid('admin','manager','inventory','operator').optional() });
export async function patch(req, res, next) { try { const body = await updateSchema.validateAsync(req.body); const u = await updateUser(req.params.id, body); if(!u) throw notFound('User'); res.json({ user: u }); } catch(e){ next(e);} }
export async function remove(req, res, next) { try { await deleteUser(req.params.id); res.json({ message: 'Deleted' }); } catch(e){ next(e);} }

export async function exportUser(req,res,next){
	try {
		const user = await getUserById(req.params.id);
		if(!user) return res.status(404).json({ error: 'User not found' });
		const format = (req.query.format||'pdf').toLowerCase();
		if(format === 'pdf'){
			const doc = new PDFDocument();
			res.setHeader('Content-Type','application/pdf');
			res.setHeader('Content-Disposition',`attachment; filename=user-${user.id}.pdf`);
			doc.pipe(res);
			doc.fontSize(18).text('User Export', { underline: true });
			doc.moveDown();
			Object.entries({ ID:user.id, Name:user.name, Email:user.email, Role:user.role, Created:user.created_at }).forEach(([k,v])=>{
				doc.fontSize(12).text(`${k}: ${v??''}`);
			});
			doc.end();
		} else if(['xlsx','excel'].includes(format)){
			const wb = new ExcelJS.Workbook();
			const ws = wb.addWorksheet('User');
			ws.columns = [ { header:'Field', key:'field' }, { header:'Value', key:'value' } ];
			[ ['ID',user.id], ['Name',user.name], ['Email',user.email], ['Role',user.role], ['Created', user.created_at] ].forEach(r=>ws.addRow({ field:r[0], value:r[1] }));
			res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
			res.setHeader('Content-Disposition',`attachment; filename=user-${user.id}.xlsx`);
			await wb.xlsx.write(res);
			res.end();
		} else {
			return res.status(400).json({ error: 'Unsupported format' });
		}
	} catch(e){ next(e); }
}
