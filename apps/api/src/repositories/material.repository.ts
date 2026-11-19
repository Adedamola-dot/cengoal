import { Material } from '../models/Material.js';
import type { IMaterial } from '../models/Material.js';

export class MaterialRepository {
  async create(materialData: Partial<IMaterial>): Promise<IMaterial> {
    return Material.create(materialData);
  }

  async findByCourse(courseId: string): Promise<IMaterial[]> {
    return Material.find({ courseId })
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IMaterial | null> {
    return Material.findById(id).populate('uploadedBy', 'name');
  }

  // Track when a student opens a material (Proof of Delivery)
  async markAsSeen(materialId: string, userId: string): Promise<void> {
    await Material.findByIdAndUpdate(
      materialId,
      { $addToSet: { 'deliveryLog.inAppSeenBy': userId } }
    );
  }
}

export const materialRepository = new MaterialRepository();