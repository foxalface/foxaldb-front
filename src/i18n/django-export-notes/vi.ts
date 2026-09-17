import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: 'Đã bỏ qua view «{{path}}».',
    keyless_table_skipped:
        'Đã bỏ qua bảng «{{path}}» vì Django V1 không tạo khóa chính thay thế.',
    schema_ignored_sqlite:
        'SQLite không dùng schema «{{schema}}»; bảng «{{path}}» được xuất mà không có bộ hạn định schema.',
    mysql_catalog_omitted:
        'Catalog MySQL «{{catalog}}» bị bỏ qua; Django dùng cơ sở dữ liệu đã kết nối và tên bảng không được hạn định.',
    mysql_multiple_catalogs_ignored:
        'Xuất MySQL bỏ qua {{count}} catalog và phát ra tên bảng không được hạn định vì tên vật lý vẫn là duy nhất.',
    mariadb_catalog_omitted:
        'Catalog MariaDB «{{catalog}}» bị bỏ qua; Django dùng cơ sở dữ liệu đã kết nối và tên bảng không được hạn định.',
    mariadb_multiple_catalogs_ignored:
        'Xuất MariaDB bỏ qua {{count}} catalog và phát ra tên bảng không được hạn định vì tên vật lý vẫn là duy nhất.',
    postgres_schema_qualified_db_table:
        'Bảng PostgreSQL «{{path}}» được xuất với db_table được hạn định bởi schema «{{schema}}».',
    composite_fk_unsupported:
        'Khóa ngoại tổ hợp «{{path}}» không được xuất; các cột thành viên vẫn là vô hướng.',
    many_to_many_skipped:
        'Quan hệ nhiều-nhiều «{{path}}» đã bị bỏ qua; không có bảng nối nào được tạo từ nhãn.',
    one_to_one_degraded_non_unique_fk:
        'Quan hệ một-một trên «{{path}}» được xuất dưới dạng ForeignKey vì khóa ngoại không duy nhất.',
    model_name_adjusted:
        'Lớp model của bảng «{{path}}» được gán là {{className}}.',
    model_name_collision:
        'Lớp model «{{className}}» cho bảng «{{path}}» được gán để tránh trùng tên lớp.',
    field_name_adjusted:
        'Trường «{{path}}» được xuất dưới dạng thuộc tính Python {{attributeName}} với db_column «{{dbColumn}}».',
    related_name_adjusted:
        'related_name trên «{{path}}» được gán là {{relatedName}} để tránh xung đột truy cập ngược.',
    composite_primary_key:
        'Bảng «{{path}}» được xuất với CompositePrimaryKey Django 6.1 dùng các thuộc tính {{attributes}}.',
    on_update_omitted:
        'ON UPDATE «{{action}}» trên «{{path}}» bị bỏ qua; ForeignKey không có tương đương ON UPDATE trong cơ sở dữ liệu.',
    on_delete_restrict_degraded:
        'ON DELETE RESTRICT trên «{{path}}» được xuất dưới dạng models.DO_NOTHING; ngữ nghĩa bộ thu thập RESTRICT/PROTECT của Django không được dùng.',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL trên «{{path}}» bị bỏ qua vì khóa ngoại không nullable; dùng models.DO_NOTHING.',
    },
    many_to_many_through_skipped: {
        extra_columns:
            'ManyToManyField tiện lợi không được tạo cho bảng nối «{{path}}» vì có các cột dữ liệu bổ sung.',
        ambiguous:
            'ManyToManyField tiện lợi không được tạo cho bảng nối «{{path}}» vì model đầu cuối không rõ ràng.',
    },
    relationship_skipped: {
        table_not_exported:
            'Quan hệ «{{path}}» bị bỏ qua vì một bảng không được xuất.',
        field_not_exported:
            'Quan hệ «{{path}}» bị bỏ qua vì một trường tham chiếu không được xuất.',
        already_relational:
            'Quan hệ «{{path}}» bị bỏ qua vì trường sở hữu đã là quan hệ.',
        primary_key_fk:
            'Quan hệ «{{path}}» bị bỏ qua vì cột sở hữu là một phần của khóa chính.',
        unsupported_target_field:
            'Quan hệ «{{path}}» bị bỏ qua vì trường đích không phải là đích Django duy nhất.',
    },
    index_omitted: {
        unsupported_type:
            'Chỉ mục «{{path}}» bị bỏ qua vì loại «{{indexType}}» không được xuất dưới dạng models.Index.',
        field_not_exported:
            'Chỉ mục «{{path}}» bị bỏ qua vì một trường tham chiếu không được xuất.',
        unsafe_name:
            'Chỉ mục «{{path}}» bị bỏ qua vì tên rõ ràng của nó không thể biểu diễn an toàn trong Django.',
    },
    index_name_adjusted: {
        unsafe_name:
            'Tên chỉ mục «{{originalName}}» đã được điều chỉnh thành «{{allocatedName}}» để đáp ứng ràng buộc đặt tên của Django.',
        name_collision:
            'Tên chỉ mục «{{originalName}}» đã được điều chỉnh thành «{{allocatedName}}» để tránh tên chỉ mục Django trùng lặp.',
    },
    constraint_name_adjusted: {
        unsafe_name:
            'Tên ràng buộc duy nhất «{{originalName}}» đã được điều chỉnh thành «{{allocatedName}}» để đáp ứng ràng buộc đặt tên của Django.',
        name_collision:
            'Tên ràng buộc duy nhất «{{originalName}}» đã được điều chỉnh thành «{{allocatedName}}» để tránh tên ràng buộc Django trùng lặp.',
    },
    comment_omitted: {
        table: 'Chú thích bảng trên «{{path}}» bị bỏ qua vì SQLite không lưu trữ chú thích.',
        column: 'Chú thích cột trên «{{path}}» bị bỏ qua vì SQLite không lưu trữ chú thích.',
    },
    check_omitted: {
        table: 'Ràng buộc CHECK trên «{{path}}» bị bỏ qua vì SQL tùy ý không thể chuyển thành biểu thức Django 6.1.',
        column: 'CHECK trên «{{path}}» bị bỏ qua vì SQL tùy ý không thể chuyển thành biểu thức Django 6.1.',
    },
    set_degraded: {
        set_as_text:
            'SET của trường «{{path}}» được xuất dưới dạng trường ký tự; các kiểu SET gốc không được tạo.',
    },
    enum_degraded: {
        enum_as_text:
            'enum của trường «{{path}}» được xuất dưới dạng trường ký tự; Django TextChoices không được tạo.',
    },
    type_omitted: {
        array: 'Trường mảng trên «{{path}}» bị bỏ qua khỏi xuất Django.',
        spatial:
            'Trường không gian trên «{{path}}» bị bỏ qua khỏi xuất Django.',
        tsvector: 'Trường tsvector trên «{{path}}» bị bỏ qua khỏi xuất Django.',
        xml: 'Trường XML trên «{{path}}» bị bỏ qua khỏi xuất Django.',
        unsupported:
            'Trường «{{path}}» bị bỏ qua vì kiểu của nó không thể biểu diễn.',
        unimplemented_database:
            'Ánh xạ kiểu chưa được triển khai cho kiểu cơ sở dữ liệu «{{databaseType}}».',
        decimal_precision_required:
            'Trường decimal trên «{{path}}» bị bỏ qua vì DecimalField MySQL/MariaDB yêu cầu max_digits và decimal_places.',
    },
    type_degraded: {
        varchar_without_max_length:
            'Kiểu ký tự của trường «{{path}}» được xuất dưới dạng {{mappedField}} vì thiếu max_length.',
    },
    default_omitted: {
        unsupported_type:
            'Giá trị mặc định trên «{{path}}» bị bỏ qua (kiểu giá trị mặc định không được hỗ trợ).',
        current_timestamp_non_datetime:
            'Giá trị mặc định trên «{{path}}» bị bỏ qua (CURRENT_TIMESTAMP trên trường không phải datetime).',
        uuid_function_non_pg:
            'Giá trị mặc định trên «{{path}}» bị bỏ qua (hàm UUID trên trường UUID không phải PostgreSQL).',
        sql_expression:
            'Giá trị mặc định trên «{{path}}» bị bỏ qua (biểu thức SQL không được hỗ trợ: {{expression}}).',
        unclear:
            'Giá trị mặc định trên «{{path}}» bị bỏ qua (giá trị mặc định không rõ: {{expression}}).',
        boolean_on_non_boolean:
            'Giá trị mặc định trên «{{path}}» bị bỏ qua (giá trị boolean trên trường không phải boolean).',
        numeric_on_non_numeric:
            'Giá trị mặc định trên «{{path}}» bị bỏ qua (giá trị số trên trường không phải số).',
    },
};
