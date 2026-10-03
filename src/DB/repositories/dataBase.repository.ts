import { HydratedDocument, Model, PopulateOptions, ProjectionType, QueryFilter, QueryOptions, Types, UpdateQuery } from "mongoose";
 

export abstract class dateBaseRepository<TDocument> {

    constructor( public readonly model : Model<TDocument>){}

    async create(data : Partial<TDocument>) : Promise<HydratedDocument<TDocument>>{
        return this.model.create(data)
    }

    async findById (id :Types.ObjectId ) : Promise<HydratedDocument<TDocument> | null>{
        return this.model.findById(id)
    } // {} || null

     async findOne ({filter , options , projection} :{
        filter:QueryFilter<TDocument>
        options?:QueryOptions<TDocument>
        projection?:ProjectionType<TDocument>
     }) : Promise<HydratedDocument<TDocument>| null>{
        return await this.model.findOne( filter ,projection )
        .populate(options?.populate as PopulateOptions )
        .exec()
    }

      async find ({
        filter ,
         options
    } :{
        filter:QueryFilter<TDocument>
        options?:QueryOptions<TDocument>
      }) : Promise<HydratedDocument<TDocument>[]| []>{
       let cursor = this.model.find( filter  )
        if(options?.populate){
        cursor = cursor.populate(options?.populate as PopulateOptions )}
        if(options?.sort){
            cursor = cursor.sort(options.sort)
        }
        if(options?. limit){
            cursor = cursor.limit(options.limit)
        }
        if(options?.  skip){
            cursor = cursor. skip(options. skip)
        }
         return await cursor.exec()
    }

      async findOneAndUpdate ({
        filter ,
        update,
        options
    } :{
        filter:QueryFilter<TDocument>
         update: UpdateQuery<TDocument>,
        options?:QueryOptions<TDocument>
      }) : Promise<HydratedDocument<TDocument>| null>{
       return this.model.findOneAndUpdate( filter, update , {new : true , runValidators: true, ...options})
    
    }
   

         async findOneAndDelete ({
        filter ,
        options
    } :{
        filter:QueryFilter<TDocument>
         options?:QueryOptions<TDocument>
      }) : Promise<HydratedDocument<TDocument>| null>{
       return this.model.findOneAndDelete( filter, options)
    
    }
}