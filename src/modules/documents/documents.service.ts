import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel }                 from '@nestjs/mongoose';
import { Model }                       from 'mongoose';
import { DocumentEntity, DocumentDoc } from './schemas/document.schema';
import { CreateDocumentDto }           from './dto/create-document.dto';
import { UpdateDocumentDto }           from './dto/update-document.dto';
import { DocumentStatus }              from '../../common/enums/document-status.enum';

@Injectable()
export class DocumentsService {

  constructor(
    @InjectModel(DocumentEntity.name)
    private readonly documentModel: Model<DocumentDoc>,
  ) {}

  // ─── Calcular estado según fecha ────────────────────────────────────────────
  private computeStatus(
    deadline?: Date,
    currentStatus?: DocumentStatus,
  ): DocumentStatus {

    // Si ya fue respondido, no cambia
    if (currentStatus === DocumentStatus.RESPONDIDO) {
      return DocumentStatus.RESPONDIDO;
    }

    if (!deadline) return DocumentStatus.PENDIENTE;

    const now      = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / msPerDay);

    if (daysLeft < 0)  return DocumentStatus.VENCIDO;
    if (daysLeft <= 3) return DocumentStatus.POR_VENCER;
    return DocumentStatus.EN_PROCESO;
  }

  // ─── Crear documento ─────────────────────────────────────────────────────────
  async create(
    dto: CreateDocumentDto,
    file: Express.Multer.File,
  ): Promise<DocumentDoc> {

    const deadline = dto.responseDeadline 
      ? new Date(dto.responseDeadline) 
      : undefined;
    const status   = this.computeStatus(deadline);

    const doc = new this.documentModel({
      title:            dto.title,
      description:      dto.description,
      notes:            dto.notes,
      responseDeadline: deadline,
      status,
      fileName:  file.originalname,
      filePath:  file.path,
      mimeType:  file.mimetype,
      fileSize:  file.size,
    });

    return doc.save();
  }

  // ─── Listar todos ─────────────────────────────────────────────────────────────
  async findAll(): Promise<DocumentDoc[]> {
    const docs = await this.documentModel
      .find()
      .sort({ createdAt: -1 })
      .exec();

    // Recalcular estado en tiempo real al consultar
    await Promise.all(
      docs.map(async (doc) => {
        const freshStatus = this.computeStatus(doc.responseDeadline, doc.status);
        if (freshStatus !== doc.status) {
          doc.status = freshStatus;
          await doc.save();
        }
      }),
    );

    return docs;
  }

  // ─── Obtener uno ──────────────────────────────────────────────────────────────
  async findOne(id: string): Promise<DocumentDoc> {
    const doc = await this.documentModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException(`Documento con ID "${id}" no encontrado`);
    }

    // Recalcular estado
    const freshStatus = this.computeStatus(doc.responseDeadline, doc.status);
    if (freshStatus !== doc.status) {
      doc.status = freshStatus;
      await doc.save();
    }

    return doc;
  }

  // ─── Actualizar ───────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateDocumentDto): Promise<DocumentDoc> {
    const doc = await this.findOne(id);

    if (dto.responseDeadline !== undefined) {
      doc.responseDeadline = dto.responseDeadline
        ? new Date(dto.responseDeadline)
        : undefined;
    }

    if (dto.status === DocumentStatus.RESPONDIDO) {
      doc.respondedAt = new Date();
      doc.status      = DocumentStatus.RESPONDIDO;
    } else {
      doc.status = this.computeStatus(doc.responseDeadline, dto.status);
    }

    Object.assign(doc, {
      title:       dto.title       ?? doc.title,
      description: dto.description ?? doc.description,
      notes:       dto.notes       ?? doc.notes,
    });

    return doc.save();
  }

  // ─── Eliminar ─────────────────────────────────────────────────────────────────
  async remove(id: string): Promise<void> {
    const result = await this.documentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Documento con ID "${id}" no encontrado`);
    }
  }

  // ─── Estadísticas para dashboard ──────────────────────────────────────────────
  async getStats(): Promise<Record<string, number>> {
    const counts = await this.documentModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return counts.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {} as Record<string, number>);
  }
}
